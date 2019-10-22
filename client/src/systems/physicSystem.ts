import { ColliderComponent } from "../components/colliderComponent";
import { Scene } from "../scene";
import { ISystem } from "./system";

// # Classe *PhysicSystem*
// Représente le système permettant de détecter les collisions
export class PhysicSystem implements ISystem {
  // Méthode *iterate*
  // Appelée à chaque tour de la boucle de jeu
  public iterate(dT: number) {
	//soit colliders une liste de ColliderComponents
    const colliders: ColliderComponent[] = [];

	//pour toutes les entités sur la scène
    for (const e of Scene.current.entities()) {
	//pour tous les composants de l'entité
      for (const comp of e.components) {
		//si le composant possède un collider activé
        if (comp instanceof ColliderComponent && comp.enabled) {
			//on l'ajoute à la liste des colliders à tester
          colliders.push(comp);
        }
      }
    }

	//soit la liste des collisions que l'on souhaite traiter
    const collisions: Array<[ColliderComponent, ColliderComponent]> = [];

	//pour tous les objets susceptibles d'être en collision
    for (let i = 0; i < colliders.length; i++) {
      const c1 = colliders[i];
	  //si le collider n'est pas activé ou si le parent n'est pas activé
      if (!c1.enabled || !c1.owner.active) {
        continue;
      }

	  //pour tous les objets avec lesquels c1 est susceptible d'avoir une collision non traitée
      for (let j = i + 1; j < colliders.length; j++) {
        const c2 = colliders[j];
		//si le collider n'est pas activé ou si le parent n'est pas activé
        if (!c2.enabled || !c2.owner.active) {
          continue;
        }

        //Si c'est nécessaire de vérifier si les objets sont en collisions
        if(((c1.mask & c2.flag) || (c2.mask & c1.flag) ) ){
          //si les deux rectangles englobants sont en collision
          if (c1.area.intersectsWith(c2.area)) {
        //on ajoute c1 et c2 à la liste des collisions à traiter
            collisions.push([c1, c2]);
          }
        }
      }
    }

	//Pour toutes les collisions à traiter, on exécute les handler s'ils existent
    for (const [c1, c2] of collisions) {
      if (c1.handler) {
        c1.handler.onCollision(c2);
      }
      if (c2.handler) {
        c2.handler.onCollision(c1);
      }
    }
  }
}
