import { Rectangle } from "./Rectangle";
import {ColliderComponent} from './components/colliderComponent';
import QuadTreeNode from './QuadTreeNode';

export class QuadTree {
    public root: QuadTreeNode;

    constructor(bounds: Rectangle, maxDepth: number, maxChildren: number) {
        this.root = new QuadTreeNode(bounds, 0, maxDepth, maxChildren);
    }

    public clear(): void {
        this.root.clear();
    }

    public insert(itemOrList: ColliderComponent | ColliderComponent[]): void {
        if (itemOrList instanceof Array) {
            this._insertItemlist(itemOrList);

            return;
        }

        this.root.insert(itemOrList);
    }

    public retrieve(item: ColliderComponent): QuadTreeNode[] | ColliderComponent[] {
        return this.root.retrieve(item).slice(0);
    }

    private _insertItemlist(itemList: ColliderComponent[]): void {
        for (let i = 0; i < itemList.length; i++) {
            this.root.insert(itemList[i]);
        }
    }
}
