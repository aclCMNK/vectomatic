function SVG_Engine(props) {
    const __SVG_URL = "http://www.w3.org/2000/svg";
    const _events = [];
    //-------------------------------
    // VARS
    //-------------------------------
    let _init_dt = 0;
    let _frame = 0;
    let _dt = 0;
    let _fps = 60;
    //-------------------------------
    // STRUCTS
    //-------------------------------
    const Point2D = {
        new: (x, y) => {
            return { x, y };
        }
    }
    const Vector2D = {
        new: (x, y) => {
            return { x, y };
        },
        scale: (v, s) => {
            return { x: v.x * s, y: v.y * s };
        },
        add: (v1, v2) => {
            return { x: v1.x + v2.x, y: v1.y + v2.y };
        },
        diff: (v1, v2) => {
            return { x: v1.x - v2.x, y: v1.y - v2.y };
        },
        mul: (v1, v2) => {
            return { x: v1.x * v2.x, y: v1.y * v2.y };
        },
        div: (v1, v2) => {
            return { x: v1.x / v2.x, y: v1.y / v2.y };
        }
    };
    //-------------------------------
    // GLOBAL METHODS
    //-------------------------------
    const add_event = (el, event, cback) => {
        if (!el) return;
        _events.push({ el, event, cback });
    }
    //-------------------------------
    // SVG ELEMENTS
    //-------------------------------
    const new_scene = (parent, opts = {}) => {
        if (!parent) return;
        console.log(opts)
        const svg = document.createElementNS(__SVG_URL, "svg");
        svg.setAttributeNS(null, "width", opts.w || 1200);
        svg.setAttributeNS(null, "height", opts.w || 900);
        svg.style.backgroundColor = opts.bg || "#fff";
        parent.appendChild(svg);
        return svg;
    };
    const dragdrop = (el, down_cback, move_cback, parent_move_cback, up_cback, leave_cback) => {
        let is_dragging = false;
        el.onmousemove = () => {
            if (typeof move_cback === "function") move_cback();
        }
        el.onmousedown = (e) => {
            is_dragging = true;
            const init_x = parseFloat(el.getAttributeNS(null, "cx"));
            const init_y = parseFloat(el.getAttributeNS(null, "cy"));
            const init_pos = Vector2D.new(init_x, init_y);
            const mouse_pos = Vector2D.new(e.clientX, e.clientY);
            if (typeof down_cback === "function") down_cback(e);
            el.parentNode.onmousemove = (e) => {
                if (!is_dragging) return;
                const mouse = Vector2D.new(e.clientX, e.clientY);
                const diff = Vector2D.diff(mouse, mouse_pos);
                const final_pos = Vector2D.add(init_pos, diff);
                el.setAttributeNS(null, "cx", final_pos.x);
                el.setAttributeNS(null, "cy", final_pos.y);
                if (typeof parent_move_cback === "function") {
                    e.final_pos = final_pos;
                    parent_move_cback(e);
                }
            }
        }
        el.onmouseleave = (e) => {
            parent.onmousemove = null;
            is_dragging = false;
            if (typeof leave_cback === "function") leave_cback(e);
        }
        el.onmouseup = (e) => {
            parent.onmousemove = null;
            is_dragging = false;
            if (typeof up_cback === "function") up_cback(e);
        }
    }
    const new_line = (parent, p1, p2, opts = {}) => {
        if (!parent) return;
        const line = document.createElementNS(__SVG_URL, "line");
        line.set_p1 = (p1) => {
            line.setAttributeNS(null, "x1", p1.x);
            line.setAttributeNS(null, "y1", p1.y);
        }
        line.set_p2 = (p2) => {
            line.setAttributeNS(null, "x2", p2.x);
            line.setAttributeNS(null, "y2", p2.y);
        }
        line.set_p1(p1);
        line.set_p2(p2);
        line.setAttributeNS(null, "stroke", opts.color || "#000");
        line.setAttributeNS(null, "stroke-width", opts.width || 1);
        parent.appendChild(line);
        return line;
    }
    const new_polyline = (parent, opts = {}, ...points) => {
        if (!parent) return;
        const line = document.createElementNS(__SVG_URL, "polyline");
        line.set_points = (...points) => {
            let pstr = ``;
            let space = "";
            for (const p of points) {
                pstr += `${space}${p.x},${p.y}`;
                space = " ";
            }
            line.setAttributeNS(null, "points", pstr);
        }
        line.mod_point = (index, p) => {
            const points = line.getAttributeNS(null, "points") || "";
            const split = points.split(" ");
            split[index] = `${p.x},${p.y}`;
            line.setAttributeNS(null, "points", split.join(" "));
        }
        line.add_point = (p) => {
            const points = line.getAttributeNS(null, "points") || "";;
            line.setAttributeNS(null, "points", `${points} ${p.x},${p.y}`);
        }
        line.preppend_point = (p) => {
            const points = line.getAttributeNS(null, "points") || "";;
            line.setAttributeNS(null, "points", `${p.x},${p.y} ${points}`);
        }
        line.set_points(points);
        line.setAttributeNS(null, "stroke", opts.color || "#000");
        line.setAttributeNS(null, "stroke-width", opts.width || 1);
        line.setAttributeNS(null, "fill", opts.fill || 1);
        parent.appendChild(line);
        return line;
    }
    const new_path = (parent, opts = {}) => {
        if (!parent) return;
        const line = document.createElementNS(__SVG_URL, "path");
        line.clear = () => {
            line.setAttributeNS(null, "d", "");
        }
        line.move = (point) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} M ${point.x},${point.y}`);
        }
        line.move_to = (vector) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} m ${vector.x},${vector.y}`);
        }
        line.line = (point) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} L ${point.x},${point.y}`);
        }
        line.line_to = (vector) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} l ${vector.x},${vector.y}`);
        }
        line.hline = (x) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} H ${x}`);
        }
        line.hline_to = (x) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} h ${x}`);
        }
        line.vline = (x) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} V ${y}`);
        }
        line.vline_to = (x) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} v ${y}`);
        }
        line.bcurve = (pe, po_control, pe_control) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} C ${po_control.x},${po_control.y} ${pe_control.x},${pe_control.y} ${pe.x},${pe.y}`);
        }
        line.bcurve_to = (pe, po_control, pe_control) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} c ${po_control.x},${po_control.y} ${pe_control.x},${pe_control.y} ${pe.x},${pe.y}`);
        }
        line.bsoft_curve = (pe, po_control, pe_control) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} S ${po_control.x},${po_control.y} ${pe_control.x},${pe_control.y} ${pe.x},${pe.y}`);
        }
        line.bsoft_curve_to = (pe, po_control, pe_control) => {
            const command = line.getAttributeNS(null, "d") || "";
            line.setAttributeNS(null, "d", `${command} s ${po_control.x},${po_control.y} ${pe_control.x},${pe_control.y} ${pe.x},${pe.y}`);
        }
        line.curve = (pe, ...pcontrols) => {
            let pstr = "";
            const end = `${pcontrols.length > 1 ? `S ${pcontrols[pcontrols.length - 1].x},${pcontrols[pcontrols.length - 1].y} ` : ""}${pe.x},${pe.y}`;
            for (let i = 0; i < pcontrols.length; i++) {
                if (i === pcontrols.length - 1) break;
                const pprev = i === 0 ? pe : pcontrols[i - 1];
                const p = pcontrols[i];
                const mid = Vector2D.scale(Vector2D.add(pprev, p), 1 / 2);
                pstr += ` ${p.x},${p.y}`;
            }
            const command = line.getAttributeNS(null, "d") || "";
            const new_command = `${command} C ${pstr} ${end}`;
            line.setAttributeNS(null, "d", new_command);
        }
        line.rel_curve = (pe, ...pcontrols) => {
            let pstr = "";
            const end = `${pcontrols.length > 1 ? `S ${pcontrols[pcontrols.length - 1].x},${pcontrols[pcontrols.length - 1].y} ` : ""}${pe.x},${pe.y}`;
            for (let i = 0; i < pcontrols.length; i++) {
                if (i === pcontrols.length - 1) break;
                const pprev = i === 0 ? pe : pcontrols[i - 1];
                const p = pcontrols[i];
                const mid = Vector2D.scale(Vector2D.add(pprev, p), 1 / 2);
                pstr += ` ${p.x},${p.y}`;
            }
            const command = line.getAttributeNS(null, "d") || "";
            const new_command = `${command} c ${pstr} ${end}`;
            line.setAttributeNS(null, "d", new_command);
        }
        line.qcurve = (pe, pc1, ...pcontrols) => {
            let pstr = "";
            const end = pcontrols.length > 0 ? `T ${pe.x},${pe.y}` : `${pe.x},${pe.y}`;
            for (let i = 0; i < pcontrols.length; i++) {
                const pprev = i === 0 ? pc1 : pcontrols[i - 1];
                const p = pcontrols[i];
                const mid = Vector2D.scale(Vector2D.add(pprev, p), 1 / 2);
                pstr += ` ${mid.x},${mid.y}${i < pcontrols.length - 1 ? ` ${p.x},${p.y}` : ""}`;
            }
            const command = line.getAttributeNS(null, "d") || "";
            const new_command = `${command} Q ${pc1.x},${pc1.y}${pstr} ${end}`;
            line.setAttributeNS(null, "d", new_command);
        }
        line.rel_qcurve = (pe, pc1, ...pcontrols) => {
            let pstr = "";
            const end = pcontrols.length > 0 ? `T ${pe.x},${pe.y}` : `${pe.x},${pe.y}`;
            for (let i = 0; i < pcontrols.length; i++) {
                const pprev = i === 0 ? pc1 : pcontrols[i - 1];
                const p = pcontrols[i];
                const mid = Vector2D.scale(Vector2D.add(pprev, p), 1 / 2);
                pstr += ` ${mid.x},${mid.y}${i < pcontrols.length - 1 ? ` ${p.x},${p.y}` : ""}`;
            }
            const command = line.getAttributeNS(null, "d") || "";
            const new_command = `${command} q ${pc1.x},${pc1.y}${pstr} ${end}`;
            line.setAttributeNS(null, "d", new_command);
        }
        line.setAttributeNS(null, "stroke", opts.color || "#000");
        line.setAttributeNS(null, "stroke-width", opts.width || 1);
        line.setAttributeNS(null, "fill", opts.fill || 1);
        parent.appendChild(line);
        return line;
    }
    const new_circle = (parent, center, radius, opts = {}) => {
        const circle = document.createElementNS(__SVG_URL, "circle");
        circle.setAttributeNS(null, "cx", center.x);
        circle.setAttributeNS(null, "cy", center.y);
        circle.setAttributeNS(null, "r", radius);
        circle.setAttributeNS(null, "stroke", opts.border_color || "#000");
        circle.setAttributeNS(null, "stroke-width", opts.border || 0);
        circle.setAttributeNS(null, "fill", opts.color || "#000");
        circle.dragdrop = (cback) => {
            const radius_offset = 20;
            dragdrop(circle, () => {
            }, (e) => {
                circle.setAttributeNS(null, "r", radius + radius_offset);
            }, (e) => {
                circle.setAttributeNS(null, "cx", e.final_pos.x);
                circle.setAttributeNS(null, "cy", e.final_pos.y);
                if(typeof cback === "function") cback(e);
            }, (e) => {
                circle.setAttributeNS(null, "r", radius);
            }, (e) => { });
        };
        parent.appendChild(circle);
        return circle;
    }
    const loop = (cback) => {
        window.requestAnimationFrame(async (dt) => {
            if (_init_dt === 0) _init_dt = Date.now();
            _frame++;
            await cback({
                dt,
                frame: _frame,
                fps: _fps,
                delta: Date.now() - _init_dt,
            });
            _dt = Date.now() - _init_dt;
            if (_dt > 1000) {
                _fps = _frame;
                _frame = 0;
                _init_dt = Date.now();
            }
            loop(cback);
        });
    }
    const __public = {
        Point2D,
        Vector2D,
        new_scene,
        new_line,
        new_path,
        new_circle,
        loop,
    };
    return __public;
}
