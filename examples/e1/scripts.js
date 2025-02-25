function App(props = {}) {
    if (!props.root) return;
    const _root = typeof props.root === 'string' ? document.querySelector(props.root) : props.root;
    const _w = props.w || 1200;
    const _h = props.h || 900;
    const _bgcolor = props.bgcolor || "#fff";

    const simulator = new Simulis({ root: _root });
    const scene = simulator.new_scene({ w: _w, h: _h, bg: _bgcolor });
    const generator1 = simulator.new_generator({
        pos: simulator.core.Point2D.new(100, 100),
    });
    const station1 = simulator.new_station({
        pos: simulator.core.Point2D.new(400, 100),
    });
    scene.add_child(generator1);
    scene.add_child(station1);



    //const entity = simulator.new_entity();
    //console.log(entity);
    //
    //const _svg = new SVG_Engine();
    //const scene = _svg.new_scene(_root, { w: _w, h: _h, bg: _bgcolor });
    ////const line = _svg.new_line(scene, {x: 0, y: 0}, {x: _w, y: _h}, {color: "#0066ff", width: 3});
    //const curve = _svg.new_path(scene, { color: "#0066ff", width: 3, fill: "none" });
    //
    //let pi = _svg.Point2D.new(10, 100);
    //let pe = _svg.Point2D.new(300, 100);
    //let pc1 = _svg.Point2D.new(10, 30);
    //let pc2 = _svg.Point2D.new(300, 130);
    //let pc3 = _svg.Point2D.new(300, 130);
    //let pc4 = _svg.Point2D.new(10, 30);
    //const pointi = _svg.new_circle(scene, pi, 5, { color: "#0066ff" });
    //const point1 = _svg.new_circle(scene, pc1, 5, { color: "#ff0000" });
    //const point2 = _svg.new_circle(scene, pc2, 5, { color: "#ff0000" });
    //const point3 = _svg.new_circle(scene, pc3, 5, { color: "#ff0000" });
    //const point4 = _svg.new_circle(scene, pc4, 5, { color: "#ff0000" });
    //const pointe = _svg.new_circle(scene, pe, 5, { color: "#0066ff" });
    //
    //pointi.dragdrop((e) => {
    //    pi = _svg.Point2D.new(e.final_pos.x, e.final_pos.y);
    //    draw_curve();
    //});
    //point1.dragdrop((e) => {
    //    pc1 = _svg.Point2D.new(e.final_pos.x, e.final_pos.y);
    //    draw_curve();
    //});
    //point2.dragdrop((e) => {
    //    pc2 = _svg.Point2D.new(e.final_pos.x, e.final_pos.y);
    //    draw_curve();
    //});
    //point3.dragdrop((e) => {
    //    pc3 = _svg.Point2D.new(e.final_pos.x, e.final_pos.y);
    //    draw_curve();
    //});
    //point4.dragdrop((e) => {
    //    pc4 = _svg.Point2D.new(e.final_pos.x, e.final_pos.y);
    //    draw_curve();
    //});
    //pointe.dragdrop((e) => {
    //    pe = _svg.Point2D.new(e.final_pos.x, e.final_pos.y);
    //    draw_curve();
    //});
    //
    //const draw_curve = () => {
    //    curve.clear();
    //    curve.move(pi);
    //    curve.curve(pe, pc1, pc2, pc3, pc4);
    //    document.querySelector("#debug").innerText = curve.outerHTML;
    //}
    //draw_curve();
    //
    //_svg.loop(async args => {
    //    const { dt, frame, fps, delta } = args;
    //});
    //
    //scene.onmousemove = (e) => {
    //    //line.set_p2({x: e.clientX, y: e.clientY});
    //};
}
