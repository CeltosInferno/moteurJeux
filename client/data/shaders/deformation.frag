precision mediump float;

/* Rendu du jeu */
uniform sampler2D uSampler;

/* Texture de déformation en rouge et vert */
uniform sampler2D uDeformation;

/* Texture pour contrôler l'intensité de la déformation */
uniform sampler2D uIntensity;

/* Interval de temps multiplié par la vitesse depuis l'activation du composant */
uniform float uTime;

/* Échelle de la déformation */
uniform float uScale;

/* Coordonnées UV du fragment */
varying vec2 vTextureCoord;



void main(void) {
    vec2 intensityVector = vec2(uTime,0.5);
    float intensity = texture2D(uIntensity, intensityVector).x * uScale;

    vec2 deformationVector = vec2(vTextureCoord.x + cos(uTime), vTextureCoord.y + sin(uTime));
    vec2 deformation = texture2D(uIntensity, deformationVector).xy * intensity;

    vec2 finalColor = vec2(vTextureCoord.x + deformation.x, vTextureCoord.y + deformation.y);
    gl_FragColor = texture2D(uSampler, finalColor);
    gl_FragColor.gb *= 0.5;
}