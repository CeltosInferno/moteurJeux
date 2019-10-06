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
    else{
      console.log("Il y a : " +  layerSprites.length);
      //On récupère la feuille de sprites
      const spriteSheet = layerSprites[0].spriteSheet;


      this.vertices = new Float32Array(4 * TextureComponent.vertexSize * layerSprites.length);
      this.indices = new Uint16Array(6 * layerSprites.length);
      var indice =0;
      for(const sprite of layerSprites){
          //trouver points
        this.vertices[indice*4]=sprite.vertices[0];
        this.vertices[indice*4+1]=sprite.vertices[1];
        this.vertices[indice*4+2]=sprite.vertices[2];
        this.vertices[indice*4+3]=sprite.vertices[3];
        //const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        this.indices[indice*6] = indice*4;
        this.indices[indice*6+1] = indice*4 + 1;
        this.indices[indice*6+2] = indice*4 + 2;
        this.indices[indice*6+3] = indice*4 + 2;
        this.indices[indice*6+4] = indice*4 + 3;
        this.indices[indice*6+5] = indice*4;

        
        indice +=1;
      }
      console.log(this.indices);
      
      //On créer le buffer et on bind les buffer
      this.vertexBuffer = GL.createBuffer()!;
      GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
      GL.bufferData(GL.ARRAY_BUFFER, this.vertices, GL.DYNAMIC_DRAW);
      this.indexBuffer = GL.createBuffer()!;
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, this.indices, GL.DYNAMIC_DRAW);

      /////////////
      //DISPLAY
      ////////////
      GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      spriteSheet.bind();
      GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_SHORT, 0);
      //spriteSheet.unbind();
    }
    
    


    
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
