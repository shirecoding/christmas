precision mediump float;

in vec2 vUV;
uniform sampler2D uTexture;

vec3 getTerrainColor(float height) {
    // Define color stops for different terrain types
    vec3 deepWater = vec3(0.0, 0.05, 0.3);
    vec3 shallowWater = vec3(0.0, 0.5, 0.8);
    vec3 lowLand = vec3(0.4, 0.6, 0.3);  // New category for very low-lying land
    vec3 sand = vec3(0.76, 0.7, 0.5);
    vec3 grass = vec3(0.2, 0.6, 0.2);
    vec3 forest = vec3(0.1, 0.4, 0.1);
    vec3 rock = vec3(0.5, 0.5, 0.5);
    vec3 snow = vec3(0.95, 0.95, 0.95);

    // Adjust these thresholds to match your data
    if (height < 0.001) return deepWater;  // Truly underwater (value 0 in PNG)
    if (height < 0.01) return mix(shallowWater, lowLand, (height - 0.001) / 0.009);  // Very low-lying land (values 1-2 in PNG)
    if (height < 0.05) return mix(lowLand, sand, (height - 0.01) / 0.04);
    if (height < 0.2) return mix(sand, grass, (height - 0.05) / 0.15);
    if (height < 0.4) return mix(grass, forest, (height - 0.2) / 0.2);
    if (height < 0.6) return mix(forest, rock, (height - 0.4) / 0.2);
    return mix(rock, snow, (height - 0.6) / 0.4);
}

void main() {

    vec4 color = texture2D(uTexture, vUV);

    float height = color.r; // Assuming the height is stored in the red channel
    vec3 terrainColor = getTerrainColor(height);

    // Apply some basic shading based on height
    float shading = 0.7 + 0.3 * height;

    gl_FragColor = vec4(terrainColor * shading, 1.0);;
}