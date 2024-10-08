export {
    AgesEnum,
    AgesSelection,
    BodyTypesEnum,
    BodyTypesSelection,
    EyeColorsEnum,
    EyeColorsSelection,
    EyeShapesEnum,
    EyeShapesSelection,
    FaceTypesEnum,
    FaceTypesSelection,
    HairColorsEnum,
    HairColorsSelection,
    HairStylesEnum,
    HairStylesSelection,
    PersonalitiesEnum,
    PersonalitiesSelection,
    SkinTypesEnum,
    SkinTypesSelection,
    type Ages,
    type BodyTypes,
    type EyeColors,
    type EyeShapes,
    type FaceTypes,
    type HairColors,
    type HairStyles,
    type Personalities,
    type SkinTypes,
};

// TODO: change to 16 personality types
type Personalities =
    | "introverted"
    | "extroverted"
    | "confident"
    | "shy"
    | "adventurous"
    | "cautious"
    | "optimistic"
    | "pessimistic"
    | "empathetic"
    | "logical"
    | "emotional"
    | "ambitious"
    | "easygoing"
    | "perfectionist"
    | "spontaneous"
    | "organized"
    | "creative"
    | "analytical"
    | "sympathetic"
    | "rebellious";

const PersonalitiesEnum = [
    "introverted",
    "extroverted",
    "confident",
    "shy",
    "adventurous",
    "cautious",
    "optimistic",
    "pessimistic",
    "empathetic",
    "logical",
    "emotional",
    "ambitious",
    "easygoing",
    "perfectionist",
    "spontaneous",
    "organized",
    "creative",
    "analytical",
    "sympathetic",
    "rebellious",
] as const;

const PersonalitiesSelection = [
    {
        value: "introverted",
        label: "Introverted",
        description: "Reserved, thoughtful, prefers solitude.",
    },
    {
        value: "extroverted",
        label: "Extroverted",
        description: "Outgoing, sociable, energized by social interaction.",
    },
    {
        value: "confident",
        label: "Confident",
        description: "Self-assured, assertive, trusts own abilities.",
    },
    {
        value: "shy",
        label: "Shy",
        description: "Timid, apprehensive in social situations.",
    },
    {
        value: "adventurous",
        label: "Adventurous",
        description: "Daring, seeks new experiences and challenges.",
    },
    {
        value: "cautious",
        label: "Cautious",
        description: "Careful, deliberate, weighs options before acting.",
    },
    {
        value: "optimistic",
        label: "Optimistic",
        description: "Positive outlook, hopeful, sees the bright side.",
    },
    {
        value: "pessimistic",
        label: "Pessimistic",
        description: "Negative outlook, expects the worst.",
    },
    {
        value: "empathetic",
        label: "Empathetic",
        description: "Sensitive to others' emotions, understanding.",
    },
    {
        value: "logical",
        label: "Logical",
        description: "Rational, analytical, values reason over emotion.",
    },
    {
        value: "emotional",
        label: "Emotional",
        description: "Expressive, sensitive, guided by feelings.",
    },
    {
        value: "ambitious",
        label: "Ambitious",
        description: "Driven, goal-oriented, desires success.",
    },
    {
        value: "easygoing",
        label: "Easygoing",
        description: "Relaxed, flexible, goes with the flow.",
    },
    {
        value: "perfectionist",
        label: "Perfectionist",
        description: "High standards, meticulous attention to detail.",
    },
    {
        value: "spontaneous",
        label: "Spontaneous",
        description: "Impulsive, acts on impulse without much planning.",
    },
    {
        value: "organized",
        label: "Organized",
        description: "Structured, methodical, prefers order and planning.",
    },
    {
        value: "creative",
        label: "Creative",
        description: "Imaginative, innovative, enjoys artistic expression.",
    },
    {
        value: "analytical",
        label: "Analytical",
        description: "Examines details, likes solving complex problems.",
    },
    {
        value: "sympathetic",
        label: "Sympathetic",
        description: "Caring, compassionate, supportive of others.",
    },
    {
        value: "rebellious",
        label: "Rebellious",
        description: "Nonconformist, challenges authority or norms.",
    },
];

type Ages =
    | "teenager"
    | "young_adult"
    | "middle_aged"
    | "elderly"
    | "adult"
    | "senior_citizen"
    | "youthful"
    | "mature"
    | "middle_aged"
    | "golden_years"
    | "prime_of_life";

const AgesEnum = [
    "teenager",
    "young_adult",
    "middle_aged",
    "elderly",
    "adult",
    "senior_citizen",
    "youthful",
    "mature",
    "middle_aged",
    "golden_years",
    "prime_of_life",
] as const;

const AgesSelection = [
    {
        value: "teenager",
        label: "Teenager",
        description: "Between 13 and 19 years old.",
    },
    {
        value: "young_adult",
        label: "Young Adult",
        description: "Between 20 and 39 years old.",
    },
    {
        value: "middle_aged",
        label: "Middle-Aged",
        description: "Between 40 and 59 years old.",
    },
    {
        value: "elderly",
        label: "Elderly",
        description: "60 years old and above.",
    },
    { value: "adult", label: "Adult", description: "Above 18 years old." },
    {
        value: "senior_citizen",
        label: "Senior Citizen",
        description: "65 years old and above.",
    },
    {
        value: "youthful",
        label: "Youthful",
        description: "Appearing younger than actual age.",
    },
    {
        value: "mature",
        label: "Mature",
        description: "Exhibiting wisdom and experience.",
    },
    {
        value: "middle_aged",
        label: "Middle-Aged",
        description: "In the prime of life.",
    },
    {
        value: "golden_years",
        label: "Golden Years",
        description: "Retirement age and beyond.",
    },
    {
        value: "prime_of_life",
        label: "Prime of Life",
        description: "Peak physical and mental condition.",
    },
];

type BodyTypes =
    | "athletic"
    | "slim"
    | "average"
    | "curvy"
    | "stocky"
    | "petite"
    | "tall"
    | "broad_shouldered"
    | "narrow"
    | "full_figured"
    | "muscular"
    | "lean"
    | "plump"
    | "lanky"
    | "hourglass"
    | "rectangular"
    | "pear_shaped"
    | "inverted_triangle"
    | "ectomorph"
    | "endomorph";

const BodyTypesEnum = [
    "athletic",
    "slim",
    "average",
    "curvy",
    "stocky",
    "petite",
    "tall",
    "broad_shouldered",
    "narrow",
    "full_figured",
    "muscular",
    "lean",
    "plump",
    "lanky",
    "hourglass",
    "rectangular",
    "pear_shaped",
    "inverted_triangle",
    "ectomorph",
    "endomorph",
] as const;

const BodyTypesSelection = [
    {
        value: "athletic",
        label: "Athletic",
        description: "Muscular and toned.",
    },
    { value: "slim", label: "Slim", description: "Lean and slender." },
    { value: "average", label: "Average", description: "Moderate build." },
    { value: "curvy", label: "Curvy", description: "Full and shapely." },
    { value: "stocky", label: "Stocky", description: "Short and sturdy." },
    { value: "petite", label: "Petite", description: "Small and delicate." },
    { value: "tall", label: "Tall", description: "Above average height." },
    {
        value: "broad_shouldered",
        label: "Broad Shouldered",
        description: "Wide shoulder span.",
    },
    { value: "narrow", label: "Narrow", description: "Slim and elongated." },
    {
        value: "full_figured",
        label: "Full-Figured",
        description: "Larger and voluptuous.",
    },
    {
        value: "muscular",
        label: "Muscular",
        description: "Highly developed muscles.",
    },
    { value: "lean", label: "Lean", description: "Thin and wiry." },
    { value: "plump", label: "Plump", description: "Round and soft." },
    { value: "lanky", label: "Lanky", description: "Tall and thin." },
    { value: "hourglass", label: "Hourglass", description: "Balanced curves." },
    {
        value: "rectangular",
        label: "Rectangular",
        description: "Straight and angular.",
    },
    {
        value: "pear_shaped",
        label: "Pear-Shaped",
        description: "Wider hips than shoulders.",
    },
    {
        value: "inverted_triangle",
        label: "Inverted Triangle",
        description: "Broad upper body.",
    },
    {
        value: "ectomorph",
        label: "Ectomorph",
        description: "Slim, little muscle.",
    },
    {
        value: "endomorph",
        label: "Endomorph",
        description: "Soft, round build.",
    },
];

type SkinTypes =
    | "fair"
    | "light"
    | "medium"
    | "olive"
    | "tan"
    | "dark"
    | "deep"
    | "bronze"
    | "peach"
    | "ebony"
    | "alabaster"
    | "caramel"
    | "golden"
    | "sable"
    | "mocha"
    | "porcelain"
    | "amber"
    | "chestnut"
    | "mahogany"
    | "honey";

const SkinTypesEnum = [
    "fair",
    "light",
    "medium",
    "olive",
    "tan",
    "dark",
    "deep",
    "bronze",
    "peach",
    "ebony",
    "alabaster",
    "caramel",
    "golden",
    "sable",
    "mocha",
    "porcelain",
    "amber",
    "chestnut",
    "mahogany",
    "honey",
] as const;

const SkinTypesSelection = [
    { value: "fair", label: "Fair", description: "Very light complexion." },
    { value: "light", label: "Light", description: "Pale, light tone." },
    { value: "medium", label: "Medium", description: "Moderate, beige tone." },
    {
        value: "olive",
        label: "Olive",
        description: "Warm, greenish undertones.",
    },
    { value: "tan", label: "Tan", description: "Sun-kissed, golden hue." },
    { value: "dark", label: "Dark", description: "Rich, deep brown." },
    { value: "deep", label: "Deep", description: "Very dark complexion." },
    { value: "bronze", label: "Bronze", description: "Reddish-brown hue." },
    {
        value: "peach",
        label: "Peach",
        description: "Light with pink undertones.",
    },
    { value: "ebony", label: "Ebony", description: "Deep, dark black." },
    {
        value: "alabaster",
        label: "Alabaster",
        description: "Pale, almost translucent.",
    },
    { value: "caramel", label: "Caramel", description: "Warm, light brown." },
    { value: "golden", label: "Golden", description: "Warm, yellowish tone." },
    {
        value: "sable",
        label: "Sable",
        description: "Dark brown, almost black.",
    },
    { value: "mocha", label: "Mocha", description: "Rich, chocolate brown." },
    {
        value: "porcelain",
        label: "Porcelain",
        description: "Very pale and smooth.",
    },
    { value: "amber", label: "Amber", description: "Warm, golden brown." },
    {
        value: "chestnut",
        label: "Chestnut",
        description: "Reddish, warm brown.",
    },
    {
        value: "mahogany",
        label: "Mahogany",
        description: "Reddish-dark brown.",
    },
    { value: "honey", label: "Honey", description: "Warm, golden undertones." },
];

type EyeShapes =
    | "almond"
    | "round"
    | "monolid"
    | "hooded"
    | "upturned"
    | "downturned"
    | "deep_set"
    | "close_set"
    | "wide_set"
    | "protruding"
    | "large"
    | "small"
    | "cat_eye"
    | "droopy"
    | "narrow"
    | "diamond"
    | "oval"
    | "heart"
    | "piercing"
    | "gentle";
const EyeShapesEnum = [
    "almond",
    "round",
    "monolid",
    "hooded",
    "upturned",
    "downturned",
    "deep_set",
    "close_set",
    "wide_set",
    "protruding",
    "large",
    "small",
    "cat_eye",
    "droopy",
    "narrow",
    "diamond",
    "oval",
    "heart",
    "piercing",
    "gentle",
] as const;

const EyeShapesSelection = [
    { value: "almond", label: "Almond", description: "Classic almond shape." },
    { value: "round", label: "Round", description: "Large and expressive." },
    { value: "monolid", label: "Monolid", description: "Smooth, no crease." },
    { value: "hooded", label: "Hooded", description: "Lid partially hidden." },
    {
        value: "upturned",
        label: "Upturned",
        description: "Outer corners lift up.",
    },
    {
        value: "downturned",
        label: "Downturned",
        description: "Outer corners droop down.",
    },
    {
        value: "deep_set",
        label: "Deep Set",
        description: "Recessed in the socket.",
    },
    {
        value: "close_set",
        label: "Close Set",
        description: "Narrow gap between eyes.",
    },
    {
        value: "wide_set",
        label: "Wide Set",
        description: "Wide gap between eyes.",
    },
    {
        value: "protruding",
        label: "Protruding",
        description: "Eyes extend outward.",
    },
    { value: "large", label: "Large", description: "Big and round." },
    { value: "small", label: "Small", description: "Petite and delicate." },
    { value: "cat_eye", label: "Cat Eye", description: "Slanted and sharp." },
    { value: "droopy", label: "Droopy", description: "Sagging, tired look." },
    { value: "narrow", label: "Narrow", description: "Thin and elongated." },
    {
        value: "diamond",
        label: "Diamond",
        description: "Wide center, sharp corners.",
    },
    { value: "oval", label: "Oval", description: "Oval-shaped and balanced." },
    { value: "heart", label: "Heart", description: "Curved, wide upper lid." },
    {
        value: "piercing",
        label: "Piercing",
        description: "Intense, sharp gaze.",
    },
    { value: "gentle", label: "Gentle", description: "Soft, kind expression." },
];

type EyeColors =
    | "blue"
    | "green"
    | "brown"
    | "hazel"
    | "gray"
    | "amber"
    | "violet"
    | "black"
    | "golden"
    | "aquamarine"
    | "turquoise"
    | "amber_green"
    | "light_brown"
    | "dark_brown"
    | "sea_green"
    | "silver"
    | "emerald"
    | "chestnut"
    | "navy_blue"
    | "icy_blue";
const EyeColorsEnum = [
    "blue",
    "green",
    "brown",
    "hazel",
    "gray",
    "amber",
    "violet",
    "black",
    "golden",
    "aquamarine",
    "turquoise",
    "amber_green",
    "light_brown",
    "dark_brown",
    "sea_green",
    "silver",
    "emerald",
    "chestnut",
    "navy_blue",
    "icy_blue",
] as const;

const EyeColorsSelection = [
    { value: "blue", label: "Blue", description: "Clear, sky-blue shade." },
    { value: "green", label: "Green", description: "Vivid, forest green." },
    { value: "brown", label: "Brown", description: "Warm, deep brown." },
    { value: "hazel", label: "Hazel", description: "Mixed green and brown." },
    { value: "gray", label: "Gray", description: "Cool, steely gray." },
    { value: "amber", label: "Amber", description: "Golden, honey tone." },
    { value: "violet", label: "Violet", description: "Rare, purple hue." },
    { value: "black", label: "Black", description: "Very dark brown." },
    { value: "golden", label: "Golden", description: "Bright, golden flecks." },
    {
        value: "aquamarine",
        label: "Aquamarine",
        description: "Blue-green mix.",
    },
    {
        value: "turquoise",
        label: "Turquoise",
        description: "Bright, clear blue-green.",
    },
    {
        value: "amber_green",
        label: "Amber Green",
        description: "Mix of amber and green.",
    },
    {
        value: "light_brown",
        label: "Light Brown",
        description: "Soft, warm brown.",
    },
    {
        value: "dark_brown",
        label: "Dark Brown",
        description: "Deep, rich brown.",
    },
    {
        value: "sea_green",
        label: "Sea Green",
        description: "Soft, oceanic green.",
    },
    { value: "silver", label: "Silver", description: "Shimmering silver hue." },
    { value: "emerald", label: "Emerald", description: "Bright, jewel green." },
    {
        value: "chestnut",
        label: "Chestnut",
        description: "Reddish-brown shade.",
    },
    { value: "navy_blue", label: "Navy Blue", description: "Deep, dark blue." },
    { value: "icy_blue", label: "Icy Blue", description: "Pale, frosty blue." },
];

type HairStyles =
    | "short_straight"
    | "long_curly"
    | "buzz_cut"
    | "bob"
    | "pixie_cut"
    | "long_wavy"
    | "afro"
    | "ponytail"
    | "mohawk"
    | "braids"
    | "dreadlocks"
    | "bun"
    | "long_straight"
    | "medium_wavy"
    | "undercut"
    | "pigtails"
    | "layered"
    | "faux_hawk"
    | "curly_bob"
    | "top_knot";

const HairStylesEnum = [
    "short_straight",
    "long_curly",
    "buzz_cut",
    "bob",
    "pixie_cut",
    "long_wavy",
    "afro",
    "ponytail",
    "mohawk",
    "braids",
    "dreadlocks",
    "bun",
    "long_straight",
    "medium_wavy",
    "undercut",
    "pigtails",
    "layered",
    "faux_hawk",
    "curly_bob",
    "top_knot",
] as const;

const HairStylesSelection = [
    {
        value: "short_straight",
        label: "Short Straight",
        description: "A sleek, straight cut.",
    },
    {
        value: "long_curly",
        label: "Long Curly",
        description: "Flowing curls down the back.",
    },
    {
        value: "buzz_cut",
        label: "Buzz Cut",
        description: "Very short and uniform.",
    },
    { value: "bob", label: "Bob", description: "Chin-length and stylish." },
    {
        value: "pixie_cut",
        label: "Pixie Cut",
        description: "Short and edgy.",
    },
    {
        value: "long_wavy",
        label: "Long Wavy",
        description: "Soft waves cascading.",
    },
    { value: "afro", label: "Afro", description: "Voluminous and round." },
    {
        value: "ponytail",
        label: "Ponytail",
        description: "Tied back and practical.",
    },
    {
        value: "mohawk",
        label: "Mohawk",
        description: "Shaved sides with a stripe.",
    },
    {
        value: "braids",
        label: "Braids",
        description: "Intricately woven strands.",
    },
    {
        value: "dreadlocks",
        label: "Dreadlocks",
        description: "Thick, rope-like locks.",
    },
    {
        value: "bun",
        label: "Bun",
        description: "Hair gathered into a bun.",
    },
    {
        value: "long_straight",
        label: "Long Straight",
        description: "Straight and down the back.",
    },
    {
        value: "medium_wavy",
        label: "Medium Wavy",
        description: "Wavy and shoulder-length.",
    },
    {
        value: "undercut",
        label: "Undercut",
        description: "Short sides, long top.",
    },
    {
        value: "pigtails",
        label: "Pigtails",
        description: "Two tied bunches.",
    },
    {
        value: "layered",
        label: "Layered",
        description: "Different length layers.",
    },
    {
        value: "faux_hawk",
        label: "Faux Hawk",
        description: "Subtle mohawk style.",
    },
    {
        value: "curly_bob",
        label: "Curly Bob",
        description: "Curly and chin-length.",
    },
    {
        value: "top_knot",
        label: "Top Knot",
        description: "Knot of hair on top.",
    },
];

type HairColors =
    | "blonde"
    | "brunette"
    | "black"
    | "red"
    | "auburn"
    | "platinum"
    | "gray"
    | "white"
    | "blue"
    | "green"
    | "pink"
    | "purple"
    | "orange"
    | "teal"
    | "burgundy"
    | "honey"
    | "chestnut"
    | "ash_blonde"
    | "silver"
    | "lavender";

const HairColorsEnum = [
    "blonde",
    "brunette",
    "black",
    "red",
    "auburn",
    "platinum",
    "gray",
    "white",
    "blue",
    "green",
    "pink",
    "purple",
    "orange",
    "teal",
    "burgundy",
    "honey",
    "chestnut",
    "ash_blonde",
    "silver",
    "lavender",
] as const;

const HairColorsSelection = [
    { value: "blonde", label: "Blonde", description: "Light and golden." },
    { value: "brunette", label: "Brunette", description: "Rich brown shade." },
    { value: "black", label: "Black", description: "Deep and dark." },
    { value: "red", label: "Red", description: "Fiery and bold." },
    { value: "auburn", label: "Auburn", description: "Reddish-brown hue." },
    { value: "platinum", label: "Platinum", description: "Very light blonde." },
    { value: "gray", label: "Gray", description: "Mature and silver." },
    { value: "white", label: "White", description: "Pure and snowy." },
    { value: "blue", label: "Blue", description: "Vivid and striking." },
    { value: "green", label: "Green", description: "Bright and unique." },
    { value: "pink", label: "Pink", description: "Playful and fun." },
    { value: "purple", label: "Purple", description: "Bold and regal." },
    { value: "orange", label: "Orange", description: "Vibrant and fiery." },
    { value: "teal", label: "Teal", description: "Cool and refreshing." },
    { value: "burgundy", label: "Burgundy", description: "Deep red wine." },
    { value: "honey", label: "Honey", description: "Warm golden tone." },
    {
        value: "chestnut",
        label: "Chestnut",
        description: "Rich reddish-brown.",
    },
    {
        value: "ash_blonde",
        label: "Ash Blonde",
        description: "Cool, muted blonde.",
    },
    { value: "silver", label: "Silver", description: "Shiny metallic gray." },
    {
        value: "lavender",
        label: "Lavender",
        description: "Soft, pastel purple.",
    },
];

type FaceTypes =
    | "oval"
    | "round"
    | "square"
    | "heart"
    | "diamond"
    | "triangular"
    | "rectangular"
    | "oblong"
    | "pear"
    | "inverted_triangle"
    | "chiseled"
    | "soft"
    | "long"
    | "wide"
    | "narrow"
    | "angular"
    | "petite"
    | "gaunt"
    | "strong_jawline"
    | "soft_square";

const FaceTypesEnum = [
    "oval",
    "round",
    "square",
    "heart",
    "diamond",
    "triangular",
    "rectangular",
    "oblong",
    "pear",
    "inverted_triangle",
    "chiseled",
    "soft",
    "long",
    "wide",
    "narrow",
    "angular",
    "petite",
    "gaunt",
    "strong_jawline",
    "soft_square",
] as const;

const FaceTypesSelection = [
    { value: "oval", label: "Oval", description: "Balanced and proportional." },
    {
        value: "round",
        label: "Round",
        description: "Full cheeks, soft curves.",
    },
    {
        value: "square",
        label: "Square",
        description: "Strong jawline, broad forehead.",
    },
    {
        value: "heart",
        label: "Heart",
        description: "Wide forehead, narrow chin.",
    },
    {
        value: "diamond",
        label: "Diamond",
        description: "Wide cheekbones, narrow forehead and chin.",
    },
    {
        value: "triangular",
        label: "Triangular",
        description: "Wide jawline, narrow forehead.",
    },
    {
        value: "rectangular",
        label: "Rectangular",
        description: "Long and angular.",
    },
    { value: "oblong", label: "Oblong", description: "Long, narrow shape." },
    {
        value: "pear",
        label: "Pear",
        description: "Wide jawline, narrow forehead.",
    },
    {
        value: "inverted_triangle",
        label: "Inverted Triangle",
        description: "Wide forehead, narrow chin.",
    },
    {
        value: "chiseled",
        label: "Chiseled",
        description: "Sharp and defined features.",
    },
    { value: "soft", label: "Soft", description: "Gentle, rounded features." },
    { value: "long", label: "Long", description: "Elongated, balanced shape." },
    { value: "wide", label: "Wide", description: "Broad and short." },
    { value: "narrow", label: "Narrow", description: "Slim and elongated." },
    {
        value: "angular",
        label: "Angular",
        description: "Sharp and defined angles.",
    },
    {
        value: "petite",
        label: "Petite",
        description: "Small and delicate features.",
    },
    { value: "gaunt", label: "Gaunt", description: "Thin and hollow cheeks." },
    {
        value: "strong_jawline",
        label: "Strong Jawline",
        description: "Pronounced, strong jaw.",
    },
    {
        value: "soft_square",
        label: "Soft Square",
        description: "Square with soft edges.",
    },
];
