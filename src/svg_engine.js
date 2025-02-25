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
        new: (x = 0, y = 0) => {
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
    const Rect2D = {
        new: (x = 0, y = 0, w = 0, h = 0) => {
            return { left: x, top: y, right: w, bottom: h, coord: Point2D.new(x, y), size: Point2D.new(w, h) };
        },
        set_coord: (rect, x, y) => {
            rect.left = x;
            rect.top = y;
            rect.coord = Point2D.new(x, y);
        },
        set_size: (rect, w, h) => {
            rect.right = w;
            rect.bottom = h;
            rect.size = Point2D.new(w, h);
        }
    }
    const Matrix2D = {
        new: (
            a = 0, b = 0, u = 0,
            c = 0, d = 0, v = 0,
            e = 0, f = 0, w = 1
        ) => {
            return {
                a, b, u,
                c, d, v,
                e, f, w
            };
        },
        translation: (x = 0, y = 0) => {
            return {
                a: 1, b: 0, u: 0,
                c: 0, d: 1, v: 0,
                e: x, f: y, w: 1
            };
        },
        translationVec: (vector) => {
            vector = vector || Vector2D.new(0, 0);
            return Matrix2D.translation(vector.x, vector.y);
        },
        rotation: (radians) => {
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            return {
                a: cos, b: -sin, u: 0,
                c: sin, d: cos, v: 0,
                e: 0, f: 0, w: 1
            };
        },
        rotationVec: (radians, vector) => {
            vector = vector || Vector2D.new(0, 0);
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const new_mat = Matrix.new(
                vector.x * cos - vector.y * sin, 0,
                vector.x * sin + vector.y * cos,
            );
            return new_mat;
        },
        scale: (s) => {
            return {
                a: s, b: 0, u: 0,
                c: 0, d: s, v: 0,
                e: 0, f: 0, w: 1
            };
        }
    }
    //-------------------------------
    // GLOBAL METHODS
    //-------------------------------
    const add_event = (el, event, cback) => {
        if (!el) return;
        _events.push({ el, event, cback });
    }
    const add_child = (parent, child) => {
        if (!parent || !child) return;
        parent.appendChild(child);
    }
    //-------------------------------
    // SVG ELEMENTS
    //-------------------------------
    const new_scene = (parent, opts = {}) => {
        if (!parent) return;
        const svg = document.createElementNS(__SVG_URL, "svg");
        svg.setAttributeNS(null, "width", opts.w || 1200);
        svg.setAttributeNS(null, "height", opts.w || 900);
        svg.style.backgroundColor = opts.bg || "#fff";
        parent.appendChild(svg);
        const root = new_group();
        svg.appendChild(root);
        return { svg, root };
    };
    const dragdrop = (el, down_cback, move_cback, parent_move_cback, up_cback, leave_cback) => {
        let is_dragging = false;
        el.onmousemove = () => {
            if (typeof move_cback === "function") move_cback();
        }
        el.onmousedown = (e) => {
            is_dragging = true;
            const matrix = el.getCTM();
            const cx = matrix.e;
            const cy = matrix.f;
            const init_x = parseFloat(cx);
            const init_y = parseFloat(cy);
            const init_pos = Vector2D.new(init_x, init_y);
            const mouse_pos = Vector2D.new(e.clientX, e.clientY);
            if (typeof down_cback === "function") down_cback(e);
            el.parentNode.onmousemove = (e) => {
                if (!is_dragging) return;
                const mouse = Vector2D.new(e.clientX, e.clientY);
                const diff = Vector2D.diff(mouse, mouse_pos);
                const final_pos = Vector2D.add(init_pos, diff);
                if (typeof parent_move_cback === "function") {
                    e.final_pos = final_pos;
                    parent_move_cback(e);
                }
            }
        }
        el.onmouseleave = (e) => {
            el.parentNode.onmousemove = null;
            is_dragging = false;
            if (typeof leave_cback === "function") leave_cback(e);
        }
        el.onmouseup = (e) => {
            el.parentNode.onmousemove = null;
            is_dragging = false;
            if (typeof up_cback === "function") up_cback(e);
        }
    }
    const new_line = (p1, p2, opts = {}) => {
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
        return line;
    }
    const new_polyline = (opts = {}, ...points) => {
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
        return line;
    }
    const new_path = (opts = {}) => {
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
        return line;
    }
    const new_circle = (center, radius, opts = {}) => {
        const circle = document.createElementNS(__SVG_URL, "circle");
        circle.setAttributeNS(null, "cx", center.x);
        circle.setAttributeNS(null, "cy", center.y);
        circle.setAttributeNS(null, "r", radius);
        circle.setAttributeNS(null, "stroke", opts.border_color || "#000");
        circle.setAttributeNS(null, "stroke-width", opts.border || 0);
        circle.setAttributeNS(null, "fill", opts.color || "#000");
        circle.dragdrop = (evs) => {
            dragdrop(circle, (e) => {
                if (typeof evs.onPress === "function") evs.onPress(e);
            }, (e) => {
                circle.setAttributeNS(null, "r", radius + radius_offset);
                if (typeof evs.onHover === "function") evs.onHover(e);
            }, (e) => {
                circle.setAttributeNS(null, "cx", e.final_pos.x);
                circle.setAttributeNS(null, "cy", e.final_pos.y);
                if (typeof evs.onMove === "function") evs.onMove(e);
            }, (e) => {
                if (typeof evs.onUp === "function") evs.onUp(e);
            }, (e) => {
                circle.setAttributeNS(null, "r", radius);
                if (typeof evs.onLeave === "function") evs.onLeave(e);
            });

        };
        return circle;
    }
    const new_rect = (p1, p2, opts = {}) => {
        const rect = document.createElementNS(__SVG_URL, "rect");
        rect.setAttributeNS(null, "x", p1.x);
        rect.setAttributeNS(null, "y", p1.y);
        rect.setAttributeNS(null, "rx", p1.radius || 0);
        rect.setAttributeNS(null, "width", p2.x - p1.x);
        rect.setAttributeNS(null, "height", p2.y - p1.y);
        rect.setAttributeNS(null, "stroke", opts.border_color || "#000");
        rect.setAttributeNS(null, "stroke-width", opts.border || 0);
        rect.setAttributeNS(null, "fill", opts.color || "#000");
        rect.dragdrop = (evs) => {
            dragdrop(rect, (e) => {
                if (typeof evs.onPress === "function") evs.onPress(e);
            }, (e) => {
                if (typeof evs.onHover === "function") evs.onHover(e);
            }, (e) => {
                if (typeof evs.onMove === "function") evs.onMove(e);
            }, (e) => {
                if (typeof evs.onUp === "function") evs.onUp(e);
            }, (e) => {
                if (typeof evs.onLeave === "function") evs.onLeave(e);
            });

        };
        return rect;
    };
    const new_image = (src, pos, w, h, opts = {}) => {
        const img = document.createElementNS(__SVG_URL, "image");
        img.setAttributeNS(null, "href", src);
        img.setAttributeNS(null, "x", pos.x);
        img.setAttributeNS(null, "y", pos.y);
        img.setAttributeNS(null, "width", w);
        img.setAttributeNS(null, "height", h);
        img.dragdrop = (evs) => {
            dragdrop(img, (e) => {
                if (typeof evs.onPress === "function") evs.onPress(e);
            }, (e) => {
                if (typeof evs.onHover === "function") evs.onHover(e);
            }, (e) => {
                if (typeof evs.onMove === "function") evs.onMove(e);
            }, (e) => {
                if (typeof evs.onUp === "function") evs.onUp(e);
            }, (e) => {
                if (typeof evs.onLeave === "function") evs.onLeave(e);
            });

        };
        return img;
    }
    const new_text = (text, pos, opts = {}) => {
        const text_node = document.createElementNS(__SVG_URL, "text");
        text_node.setAttributeNS(null, "x", pos.x);
        text_node.setAttributeNS(null, "y", pos.y);
        text_node.setAttributeNS(null, "fill", opts.color || "#000");
        text_node.setAttributeNS(null, "style", `font-size: ${opts.size || 12}px; font-family: ${opts.font || "Arial"}`);
        text_node.textContent = text;
        text_node.dragdrop = (evs) => {
            dragdrop(text_node, (e) => {
                if (typeof evs.onPress === "function") evs.onPress(e);
            }, (e) => {
                if (typeof evs.onHover === "function") evs.onHover(e);
            }, (e) => {
                if (typeof evs.onMove === "function") evs.onMove(e);
            }, (e) => {
                if (typeof evs.onUp === "function") evs.onUp(e);
            }, (e) => {
                if (typeof evs.onLeave === "function") evs.onLeave(e);
            });

        };
        return text_node;
    }
    const new_group = (opts = {}) => {
        const g = document.createElementNS(__SVG_URL, "g");
        let transform = "";
        if (opts.radians) {
            opts.pivot = opts.pivot || Point2D.new();
            transform += `rotate(${opts.radians} ${opts.pivot.x} ${opts.pivot.y})`;
        }
        if (opts.pos) {
            opts.pos = opts.pos || Point2D.new();
            transform += `translate(${opts.pos.x || 0},${opts.pos.y || 0})`;
        }
        if (opts.scale) {
            transform += `scale(${opts.scale})`;
        }
        if (transform.trim() !== "") {
            g.setAttributeNS(null, "transform", transform);
        }
        g.dragdrop = (evs) => {
            dragdrop(g, (e) => {
                if (typeof evs.onPress === "function") evs.onPress(e);
            }, (e) => {
                if (typeof evs.onHover === "function") evs.onHover(e);
            }, (e) => {
                if (typeof evs.onMove === "function") evs.onMove(e);
            }, (e) => {
                if (typeof evs.onUp === "function") evs.onUp(e);
            }, (e) => {
                if (typeof evs.onLeave === "function") evs.onLeave(e);
            });

        };
        return g;
    }
    const str2group = (opts) => {
        if (!opts.inner) return;
        const g = new_group(opts);
        g.innerHTML = opts.inner;
        return g;
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
        Rect2D,
        Matrix2D,
        add_child,
        new_scene,
        new_group,
        str2group,
        new_line,
        new_path,
        new_circle,
        new_rect,
        new_image,
        new_text,
        loop,
    };
    return __public;
}
