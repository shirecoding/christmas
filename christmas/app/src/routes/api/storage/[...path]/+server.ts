import { hashObject, requireLogin } from "$lib/server/index.js";
import { BUCKETS, ObjectStorage } from "$lib/server/objectStorage.js";
import { json } from "@sveltejs/kit";

// Get storage (api/storage/{bucket}/{acl=public|private}/{name})
export async function GET(event) {
    const { path } = event.params as { path: string };
    const [bucket, acl, filename] = path.split("/");

    // Check valid bucket
    if (!Object.values(BUCKETS).includes(bucket)) {
        return json(
            { status: "error", message: `Invalid bucket: ${bucket}` },
            { status: 400 },
        );
    }

    // Check valid acl
    if (!["public", "private"].includes(acl)) {
        return json(
            { status: "error", message: `Invalid acl: ${acl}` },
            { status: 400 },
        );
    }

    // Check require login (for private objects)
    let owner = null;
    if (acl === "private") {
        const user = requireLogin(event);
        owner = user.publicKey;
    }

    // Get redirect url
    try {
        if (
            [
                BUCKETS.coupon,
                BUCKETS.store,
                BUCKETS.user,
                BUCKETS.image,
            ].includes(bucket)
        ) {
            const redirectUrl = await ObjectStorage.redirectObjectUrl({
                owner,
                bucket,
                name: filename,
            });

            return new Response(null, {
                status: 302,
                headers: {
                    Location: redirectUrl,
                },
            });
        } else {
            return json(
                {
                    status: "error",
                    message: `Invalid bucket: ${bucket} not supported`,
                },
                { status: 400 },
            );
        }
    } catch (error: any) {
        return json(
            { status: "error", message: error.message },
            { status: 400 },
        );
    }
}