function Simulis(props) {
    //-----------------------------
    // CONSTANTS
    //-----------------------------
    const __ROOT__ = typeof props.root === 'string' ? document.querySelector(props.root) : props.root;
    const __SVG__ = new SVG_Engine();
    //-----------------------------
    // VARS
    //-----------------------------
    //-----------------------------
    // FUNCTIONS
    //-----------------------------
    const run = () => {
    }

    //-----------------------------
    // CLASSES
    //-----------------------------
    function node(node_props = {}) {
        this.id = node_props.id || (Math.ceil(Math.random() * Date.now())).toString(16);
        this.pos = node_props.pos || __SVG__.Vector2D.new(0, 0);
        this.svg;
        this.rotation = 0;
        this.parent;
        this.childs = [];
        this.name = node_props.name || "new_node";
        this.caption = node_props.caption || "New Node";

        this.add_child = (child) => {
            this.childs.push(child);
            child.parent = this;
            __SVG__.add_child(this.svg, child.svg);
        }
    };
    function Entity(entity_props = {}) {
        node.call(this, entity_props);
        this.svg = __SVG__.new_group({
            pos: entity_props.pos || __SVG__.Vector2D.new(0, 0),
            radians: entity_props.rotation || 0,
            pivot: entity_props.pivot || __SVG__.Vector2D.new(0, 0),
            scale: entity_props.scale || 1
        });
    }
    function MovieClip(movieclip_props = {}) {
        Entity.call(this, movieclip_props);
    }
    function Scene(scene_props = {}) {
        node.call(this, scene_props);
        this.scene = __SVG__.new_scene(__ROOT__, scene_props);
        this.svg = this.scene.root;
    };
    function Flow_Node(flow_node_props = {}) {
        node.call(this, flow_node_props);

        const caption = `(${flow_node_props.caption || "New Node"})`;
        const pos = flow_node_props.pos || __SVG__.Vector2D.new(0, 0);
        const main_w = flow_node_props.w || 80;
        const main_h = flow_node_props.h || 105;
        const ico_src = flow_node_props.ico || __DEFAULT__;
        const bg_color = flow_node_props.color || "#000";
        const text_props = flow_node_props.text || { color: "#EEE", size: 12 };

        this.caption = caption;
        const size_bg = __SVG__.Rect2D.new(0, 0, main_w, main_h);
        const size_title_bar = __SVG__.Rect2D.new(0, 0, size_bg.right, 25);
        __SVG__.Rect2D.set_coord(size_bg, 0, size_title_bar.bottom + 5);

        this.svg = __SVG__.new_group({
            pos
        });
        this.title_bar = __SVG__.new_rect(size_title_bar.coord, size_title_bar.size, {
            color: bg_color,
        });
        this.background = __SVG__.new_rect(size_bg.coord, size_bg.size, {
            color: bg_color
        });

        const ico_size = __SVG__.Rect2D.new(0, 0, 50, 65);
        __SVG__.Rect2D.set_coord(ico_size, size_bg.right / 2 - ico_size.right / 2, size_bg.bottom / 2 - ico_size.bottom / 2 + size_bg.top / 2);
        this.ico = __SVG__.new_image(ico_src, ico_size.coord, ico_size.size.x, ico_size.size.y, flow_node_props.ico);

        this.label = __SVG__.new_text(this.caption, __SVG__.Vector2D.new(7, 14), text_props);

        __SVG__.add_child(this.svg, this.title_bar);
        __SVG__.add_child(this.svg, this.background);
        __SVG__.add_child(this.svg, this.ico);
        __SVG__.add_child(this.svg, this.label);
        let parentNode;

        let click_event = true;
        this.svg.onclick = () => {
            if (!click_event) return;
            if (typeof flow_node_props.onclick === 'function') flow_node_props.onclick();
        }

        this.svg.dragdrop({
            onPress: () => {
                const parentNode = this.svg.parentNode;
                window.setTimeout(() => {
                    parentNode.removeChild(this.svg);
                    parentNode.appendChild(this.svg);
                }, 300);
                this.svg.setAttributeNS(null, "style", "cursor: grabbing;");
            },
            onHover: () => {
                this.svg.setAttributeNS(null, "style", "cursor: grab");
            },
            onMove: (e) => {
                click_event = false;
                this.svg.setAttributeNS(null, "style", "cursor: grabbing; z-index: 1000 !important; position:absolute;");
                this.svg.setAttributeNS(null, "transform", `translate(${e.final_pos.x}, ${e.final_pos.y})`);
            },
            onUp: () => {
                window.setTimeout(() => {
                    click_event = true;
                }, 300);
                this.svg.setAttributeNS(null, "style", "cursor: grab;");
            },
            onLeave: () => {
                this.svg.setAttributeNS(null, "style", "cursor: auto");
            },
        });
    }
    function Generator(generator_props = {}) {
        generator_props.caption = "Generador";
        generator_props.w = 80;
        generator_props.h = 105;
        generator_props.ico = __FAN__;
        generator_props.color = "#1a1b27";
        Flow_Node.call(this, generator_props);
    }
    function Station(station_props = {}) {
        station_props.caption = "Estación";
        station_props.w = 110;
        station_props.h = 120;
        station_props.color = "#1a1b27";
        Flow_Node.call(this, station_props);
    }

    const __public = {
        run,
        core: __SVG__,
        new_node: (node_props) => new node(node_props),
        new_scene: (scene_props) => new Scene(scene_props),
        new_generator: (generator_props) => new Generator(generator_props),
        new_station: (station_props) => new Station(station_props),
        new_entity: (entity_props) => new Entity(entity_props),
        new_movieclip: (movieclip_props) => new MovieClip(movieclip_props),
    };
    return __public;
}
