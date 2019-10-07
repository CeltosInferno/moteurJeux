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

    /* On définit les coordonées que l'on va aller chercher dans uIntensity*/
    vec2 intensityCoords = vec2(uTime,0.5);
    /* On extrait la valeur de x de uIntensity (les données de ce dernier étant représentées sur une ligne) et on y applique l'échelle */
    float intensity = texture2D(uIntensity, intensityCoords).x * uScale;

    /* On applique une déformation aux coordonnées qui vont êtrechoisies */
    vec2 deformationCoords = vec2( vTextureCoord.x + cos(uTime), vTextureCoord.y + sin(uTime));

    vec2 deformation = texture2D(uDeformation, deformationCoords).xy * intensity;

    /* On ajoute le vecteur déformation aux coordonnées de fragColor  */
    vec2 finalColor = vec2(vTextureCoord.x + deformation.x, vTextureCoord.y + deformation.y);
    gl_FragColor = texture2D(uSampler, finalColor);
    //gl_FragColor.gb *= 0.5;
}