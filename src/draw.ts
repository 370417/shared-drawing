import paper from 'paper';

export function setupCanvas(canvas: HTMLCanvasElement) {
    paper.setup(canvas);
    const tool = new paper.Tool();
    let centerPath: paper.Path;
    let brushPaths: paper.Path[];

    tool.onMouseDown = function(event) {
        centerPath = new paper.Path();
        centerPath.strokeColor = 'black';
        centerPath.visible = false;
        centerPath.add(event.point);
        brushPaths = [];
        for (let i = 0; i < 9; i++) {
            brushPaths.push(new paper.Path());
        }
    }

    tool.onMouseDrag = function(event) {
        centerPath.add(event.point);
        if (centerPath.segments.length > 3) {
            centerPath.smooth({
                type: 'catmull-rom',
                from: centerPath.segments.length - 4,
                to: centerPath.segments.length - 1,
            });
        }
        for (let i = 0; i < brushPaths.length; i++) {
            const offset = -1 + 2 * i / (brushPaths.length - 1);
            brushPaths[i].remove();
            brushPaths[i] = centerPath.clone();
            brushPaths[i].visible = true;
            brushPaths[i].translate(new paper.Point(2 * offset, -1.4 * offset));
        }
    }
}
