import * as GraphicsAPI from "../graphicsAPI";
import { IEntity } from "../entity";
import { IDisplayComponent } from "../systems/displaySystem";
import { Component } from "./component";
import { SpriteComponent } from "./spriteComponent";
import { TextureComponent } from "./textureComponent";

let GL: WebGLRenderingContext;


// # Classe *LayerComponent*
// Ce composant représente un ensemble de sprites qui
// doivent normalement être considérées comme étant sur un
// même plan.
export class LayerComponent extends Component<object> implements IDisplayComponent {
  
  private vertexBuffer! : WebGLBuffer;
  private indexBuffer! : WebGLBuffer;
  private vertices! : Float32Array;
  private indices! : Uint16Array;

  // ## Méthode *display*
  // La méthode *display* est appelée une fois par itération
  // de la boucle de jeu.
  public display(dT: number) {
    GL = GraphicsAPI.context;

    const layerSprites = this.listSprites();
    if (layerSprites.length === 0) {
      return;
    }

    //On récupère la feuille de sprites
    const spriteSheet = layerSprites[0].spriteSheet;

    
    let v: any[] = [];
    let i: any[] = [];
    var indice =0;

    //On ajoute tous les sprites à rendre
    for(const sprite of layerSprites){
      const spriteIndex = indice * 4;
          v = v.concat(Array.prototype.slice.call(sprite.vertices));
          i = i.concat([spriteIndex, spriteIndex + 1, spriteIndex + 2, spriteIndex + 2, spriteIndex + 3, spriteIndex]);
          indice++;
    }

    this.indices = new Uint16Array(i);
    this.vertices = new Float32Array(v);

    //On crée le buffer et on bind les buffer
    //Buffer de vertex
    this.vertexBuffer = GL.createBuffer()!;
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.DYNAMIC_DRAW);
    //Buffer d'index
    this.indexBuffer = GL.createBuffer()!;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.DYNAMIC_DRAW);

    /////////////
    //DISPLAY
    ////////////
    spriteSheet.bind();
    GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0);
    spriteSheet.unbind();

  }

  // ## Fonction *listSprites*
  // Cette fonction retourne une liste comportant l'ensemble
  // des sprites de l'objet courant et de ses enfants.
  private listSprites() {
    const sprites: SpriteComponent[] = [];
    const queue: IEntity[] = [this.owner];
    while (queue.length > 0) {
      const node = queue.shift() as IEntity;
      for (const child of node.children) {
        if (child.active) {
          queue.push(child);
        }
      }

      for (const comp of node.components) {
        if (comp instanceof SpriteComponent && comp.enabled) {
          sprites.push(comp);
        }
      }
    }

    return sprites;
  }
}
