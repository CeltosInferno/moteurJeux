import { Rectangle } from "./Rectangle";
import {ColliderComponent} from './components/colliderComponent';

enum NODE_POSITION {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
}

class QuadTreeNode {
    public bounds: Rectangle;
    public children: ColliderComponent[] = [];
    public nodes: QuadTreeNode[] = [];
    public maxChildren: number = 4;
    public maxDepth: number = 4;
    public depth: number = 0;

    constructor(
        bounds: Rectangle,
        depth: number,
        maxDepth: number,
        maxChildren: number
    ) {
        this.bounds = bounds;

        if (maxChildren) {
            this.maxChildren = maxChildren;
        }

        if (maxDepth) {
            this.maxDepth = maxDepth;
        }

        if (depth) {
            this.depth = depth;
        }
    }

    clear(): void {
        this.children = [];

        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];
    }

    findIndex(item: Rectangle): number {
        let index = NODE_POSITION.TOP_LEFT;

        const isLeft: boolean = item.x > this.bounds.horizontalMidpoint;
        const isTop: boolean = item.y > this.bounds.verticalMidpoint;

        if (isLeft && !isTop) {
            index = NODE_POSITION.BOTTOM_LEFT;
        } else if (!isTop) {
            index = NODE_POSITION.TOP_RIGHT;
        } else {
            index = NODE_POSITION.BOTTOM_RIGHT;
        }

        return index;
    }

    convertToRectangle(box : ColliderComponent) : Rectangle{
        return new Rectangle(box.area.xMin, box.area.yMin, (box.area.xMax-box.area.xMin)/2, (box.area.yMax-box.area.yMin)/2);
    }

    insert(item: ColliderComponent): void {
        if (this.nodes.length) {
            const index = this.findIndex(this.convertToRectangle(item));

            this.nodes[index].insert(item);

            return;
        }

        this.children.push(item);

        if (this.depth < this.maxDepth && this.children.length > this.maxChildren) {
            this.subdivide();

            for (let i = 0; i < this.children.length; i++) {
                this.insert(this.children[i]);
            }

            this.children = [];
        }
    }

    retrieve(item: ColliderComponent): QuadTreeNode[] | ColliderComponent[] {
        if (this.nodes.length > 0) {
            const index = this.findIndex(this.convertToRectangle(item));

            return this.nodes[index].retrieve(item);
        }

        return this.children;
    }

    subdivide(): void {
        const nextDepth = this.depth + 1;

        this.nodes[NODE_POSITION.TOP_LEFT] = new QuadTreeNode(
            new Rectangle(
                this.bounds.x,
                this.bounds.y,
                this.bounds.halfWidth,
                this.bounds.halfHeight
            ),
            nextDepth,
            this.maxDepth,
            this.maxChildren
        );

        this.nodes[NODE_POSITION.TOP_RIGHT] = new QuadTreeNode(
            new Rectangle(
                this.bounds.horizontalMidpoint,
                this.bounds.y,
                this.bounds.halfWidth,
                this.bounds.halfHeight
            ),
            nextDepth,
            this.maxDepth,
            this.maxChildren
        );

        this.nodes[NODE_POSITION.BOTTOM_LEFT] = new QuadTreeNode(
            new Rectangle(
                this.bounds.x,
                this.bounds.verticalMidpoint,
                this.bounds.halfWidth,
                this.bounds.halfHeight
            ),
            nextDepth,
            this.maxDepth,
            this.maxChildren
        );

        this.nodes[NODE_POSITION.BOTTOM_RIGHT] = new QuadTreeNode(
            new Rectangle(
                this.bounds.horizontalMidpoint,
                this.bounds.verticalMidpoint,
                this.bounds.halfWidth,
                this.bounds.halfHeight
            ),
            nextDepth,
            this.maxDepth,
            this.maxChildren
        );
    }
}

export default QuadTreeNode;