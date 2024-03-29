import React, {
    useState,
    useEffect,
    useRef,
    ChangeEvent,
    FormEvent,
} from "react";

import { CreateCoupon } from "../../queries/queries";
import { COUNTRY_DETAILS, GOOGLE_MAPS_API_KEY } from "../../../lib/constants";
import GoogleMapReact from "google-map-react";
import { useClientDevice } from "@/providers/clientDeviceProvider";

const Marker: React.FC<{ text: string; lat: number; lng: number }> = ({
    text,
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1.25em"
            viewBox="0 0 384 512"
        >
            <style>{`svg{fill:#fd4444}`}</style>
            <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" />
        </svg>
    );
};

interface CreateCouponModalProps {
    onClose: () => void;
    onCreateCoupon: (formData: CreateCoupon) => void;
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
    onClose,
    onCreateCoupon,
}) => {
    const clientDevice = useClientDevice();

    const [formData, setFormData] = useState<CreateCoupon>({
        name: "",
        symbol: "",
        description: "",
        region: clientDevice?.country?.code || "",
        geo: "",
        image: null,
        uri: "",
    });

    const [image, setImage] = useState<string | null>(null);

    const addressInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (clientDevice) {
            setFormData((prevData) => ({
                ...prevData,
                geo: clientDevice.geohash || "",
            }));
        }
    }, [clientDevice]);

    const handleChange = (
        e:
            | ChangeEvent<HTMLInputElement>
            | ChangeEvent<HTMLSelectElement>
            | ChangeEvent<HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prevData) => ({
                ...prevData,
                image: file,
            }));

            // file preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onCreateCoupon(formData);
    };

    const handleGoogleMapsApiLoaded = ({
        maps,
        map,
    }: {
        maps: any;
        map: any;
    }) => {
        // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform

        const autocomplete = new maps.places.Autocomplete(
            addressInput.current,
            {
                componentRestrictions: { country: ["us", "ca"] },
                fields: ["address_components", "geometry"],
                types: ["address"],
            }
        );

        if (addressInput.current) {
            addressInput.current.focus();
        }

        function fillInAddress() {
            // Get the place details from the autocomplete object.
            const place = autocomplete.getPlace();
            let address1 = "";
            let postcode = "";

            // Get each component of the address from the place details,
            // and then fill-in the corresponding field on the form.
            // place.address_components are google.maps.GeocoderAddressComponent objects
            // which are documented at http://goo.gle/3l5i5Mr
            for (const component of place.address_components) {
                // @ts-ignore remove once typings fixed
                const componentType = component.types[0];

                switch (componentType) {
                    case "street_number": {
                        address1 = `${component.long_name} ${address1}`;
                        break;
                    }

                    case "route": {
                        address1 += component.short_name;
                        break;
                    }

                    case "postal_code": {
                        postcode = `${component.long_name}${postcode}`;
                        break;
                    }

                    case "postal_code_suffix": {
                        postcode = `${postcode}-${component.long_name}`;
                        break;
                    }

                    case "locality":
                        (
                            document.querySelector(
                                "#locality"
                            ) as HTMLInputElement
                        ).value = component.long_name;
                        break;

                    case "administrative_area_level_1": {
                        (
                            document.querySelector("#state") as HTMLInputElement
                        ).value = component.short_name;
                        break;
                    }

                    case "country":
                        (
                            document.querySelector(
                                "#country"
                            ) as HTMLInputElement
                        ).value = component.long_name;
                        break;
                }
            }

            if (addressInput.current) {
                addressInput.current.value = address1;
                // postalField.value = postcode;

                // After filling the form with address components from the Autocomplete
                // prediction, set cursor focus on the second address line to encourage
                // entry of subpremise information such as apartment, unit, or floor number.
                addressInput.current.focus();
            }
        }

        autocomplete.addListener("place_changed", fillInAddress);
    };

    return (
        <div className="modal fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
            <div className="modal-content bg-white p-4 rounded-lg w-full max-w-lg relative">
                <button
                    className="close-button absolute top-4 right-4"
                    onClick={onClose}
                >
                    Close
                </button>
                <h2 className="text-xl font-bold mb-4">Create Coupon</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex">
                        <label
                            htmlFor="name"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Name:
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            maxLength={36}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="border rounded p-1 flex-1"
                        />
                    </div>
                    <div className="mb-4 flex">
                        <label
                            htmlFor="symbol"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Symbol:
                        </label>
                        <input
                            type="text"
                            id="symbol"
                            name="symbol"
                            maxLength={14}
                            value={formData.symbol}
                            onChange={handleChange}
                            required
                            className="border rounded p-1 flex-1"
                        />
                    </div>
                    <div className="mb-4 flex">
                        <label
                            htmlFor="description"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Description:
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            maxLength={2048}
                            value={formData.description}
                            onChange={handleChange}
                            className="border rounded p-1 flex-1"
                        />
                    </div>
                    <div className="mb-4 flex">
                        <label
                            htmlFor="region"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Region:
                        </label>
                        <select
                            id="region"
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            required
                            className="border rounded p-1 flex-1"
                        >
                            {Object.values(COUNTRY_DETAILS).map(
                                ([code, name]) => (
                                    <option value={code} id={code} key={code}>
                                        {name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="mb-4 flex">
                        <label
                            htmlFor="geo"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Location:
                        </label>

                        <input
                            type="text"
                            id="geo"
                            name="geo"
                            value={formData.geo}
                            onChange={handleChange}
                            className="border rounded p-1 flex-1"
                        />
                    </div>

                    <div className="mb-4 flex">
                        <label
                            htmlFor="geo"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Address:
                        </label>

                        <input
                            ref={addressInput}
                            type="text"
                            id="address"
                            name="address"
                            className="border rounded p-1 flex-1"
                        />
                    </div>

                    {clientDevice?.geolocationCoordinates && (
                        <div style={{ height: "30vh", width: "100%" }}>
                            <GoogleMapReact
                                bootstrapURLKeys={{
                                    key: GOOGLE_MAPS_API_KEY,
                                    libraries: ["places"],
                                }}
                                defaultCenter={{
                                    lat: clientDevice.geolocationCoordinates
                                        .latitude,
                                    lng: clientDevice.geolocationCoordinates
                                        .longitude,
                                }}
                                defaultZoom={14}
                                yesIWantToUseGoogleMapApiInternals
                                onGoogleApiLoaded={handleGoogleMapsApiLoaded}
                            >
                                <Marker
                                    lat={
                                        clientDevice.geolocationCoordinates
                                            .latitude
                                    }
                                    lng={
                                        clientDevice.geolocationCoordinates
                                            .longitude
                                    }
                                    text="My Marker"
                                />
                            </GoogleMapReact>
                        </div>
                    )}

                    <div className="mb-4 flex">
                        <label
                            htmlFor="image"
                            className="w-20 pr-2 flex-shrink-0"
                        >
                            Image:
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageUpload}
                            className="border rounded p-1 flex-1"
                        />
                        {image && (
                            <img
                                src={image}
                                alt="Preview"
                                className="mt-2 w-24 h-24"
                            />
                        )}
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Create Coupon
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCouponModal;
