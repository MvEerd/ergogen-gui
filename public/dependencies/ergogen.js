/*!
 * Ergogen v9.9.9-mveerd-3.1.0
 * https://zealot.hu/ergogen
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('makerjs'), require('js-yaml'), require('@jscad/openjscad'), require('mathjs'), require('kle-serial'), require('semver')) :
    typeof define === 'function' && define.amd ? define(['makerjs', 'js-yaml', '@jscad/openjscad', 'mathjs', 'kle-serial', 'semver'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ergogen = factory(global.makerjs, global.jsyaml, global.myjscad, global.math, global.kle, global.semver));
})(this, (function (require$$0, require$$2, require$$2$1, require$$3, require$$1, require$$8) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
    var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
    var require$$2__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$2$1);
    var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);
    var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
    var require$$8__default = /*#__PURE__*/_interopDefaultLegacy(require$$8);

    var utils = {};

    const m$5 = require$$0__default["default"];

    utils.deepcopy = value => {
        if (value === undefined) return undefined
        return JSON.parse(JSON.stringify(value))
    };

    utils.deep = (obj, key, val) => {
        const levels = key.split('.');
        const last = levels.pop();
        let step = obj;
        for (const level of levels) {
            step[level] = step[level] || {};
            step = step[level];
        }
        if (val === undefined) return step[last]
        step[last] = val;
        return obj
    };

    const eq = utils.eq = (a=[], b=[]) => {
        return a[0] === b[0] && a[1] === b[1]
    };

    const line = utils.line = (a, b) => {
        return new m$5.paths.Line(a, b)
    };

    utils.circle = (p, r) => {
        return {paths: {circle: new m$5.paths.Circle(p, r)}}
    };

    utils.rect = (w, h, o=[0, 0]) => {
        const res = {
            top:    line([0, h], [w, h]),
            right:  line([w, h], [w, 0]),
            bottom: line([w, 0], [0, 0]),
            left:   line([0, 0], [0, h])
        };
        return m$5.model.move({paths: res}, o)
    };

    utils.poly = (arr) => {
        let counter = 0;
        let prev = arr[arr.length - 1];
        const res = {
            paths: {}
        };
        for (const p of arr) {
            if (eq(prev, p)) continue
            res.paths['p' + (++counter)] = line(prev, p);
            prev = p;
        }
        return res
    };

    const farPoint = [1234.1234, 2143.56789];

    utils.union = (a, b) => {
        return m$5.model.combine(a, b, false, true, false, true, {
            farPoint
        })
    };

    utils.subtract = (a, b) => {
        return m$5.model.combine(a, b, false, true, true, false, {
            farPoint
        })
    };

    utils.intersect = (a, b) => {
        return m$5.model.combine(a, b, true, false, true, false, {
            farPoint
        })
    };

    utils.stack = (a, b) => {
        return {
            models: {
                a, b
            }
        }
    };

    var io$1 = {};

    var assert$1 = {};

    const m$4 = require$$0__default["default"];
    const u$6 = utils;

    var point = class Point {
        constructor(x=0, y=0, r=0, meta={}) {
            if (Array.isArray(x)) {
                this.x = x[0];
                this.y = x[1];
                this.r = 0;
                this.meta = {};
            } else {
                this.x = x;
                this.y = y;
                this.r = r;
                this.meta = meta;
            }
        }

        get p() {
            return [this.x, this.y]
        }

        set p(val) {
            [this.x, this.y] = val;
        }

        shift(s, relative=true) {
            if (relative) {
                s = m$4.point.rotate(s, this.r);
            }
            this.x += s[0];
            this.y += s[1];
            return this
        }

        rotate(angle, origin=[0, 0]) {
            this.p = m$4.point.rotate(this.p, angle, origin);
            this.r += angle;
            return this
        }

        mirror(x) {
            this.x = 2 * x - this.x;
            this.r = -this.r;
            return this
        }

        clone() {
            return new Point(
                this.x,
                this.y,
                this.r,
                u$6.deepcopy(this.meta)
            )
        }

        position(model) {
            return m$4.model.moveRelative(m$4.model.rotate(model, this.r), this.p)
        }

        rect(size=14) {
            let rect = u$6.rect(size, size, [-size/2, -size/2], this.meta.mirrored);
            return this.position(rect)
        }
    };

    const mathjs = require$$3__default["default"];

    const mathnum = assert$1.mathnum = raw => units => {
        return mathjs.evaluate(`${raw}`, units || {})
    };

    const assert = assert$1.assert = (exp, msg) => {
        if (!exp) {
            throw new Error(msg)
        }
    };

    const type = assert$1.type = val => units => {
        if (Array.isArray(val)) return 'array'
        if (val === null) return 'null'
        try {
            const num = mathnum(val)(units);
            if (typeof num === 'number') return 'number'
        } catch (err) {}
        return typeof val
    };

    const sane = assert$1.sane = (val, name, _type) => units => {
        assert(type(val)(units) == _type, `Field "${name}" should be of type ${_type}!`);
        if (_type == 'number') return mathnum(val)(units)
        return val
    };

    assert$1.unexpected = (obj, name, expected) => {
        const sane_obj = sane(obj, name, 'object')();
        for (const key of Object.keys(sane_obj)) {
            assert(expected.includes(key), `Unexpected key "${key}" within field "${name}"!`);
        }
    };

    assert$1.in = (raw, name, arr) => {
        assert(arr.includes(raw), `Field "${name}" should be one of [${arr.join(', ')}]!`);
        return raw
    };

    const arr = assert$1.arr = (raw, name, length, _type, _default) => units => {
        assert(type(raw)(units) == 'array', `Field "${name}" should be an array!`);
        assert(length == 0 || raw.length == length, `Field "${name}" should be an array of length ${length}!`);
        raw = raw.map(val => val || _default);
        raw.map(val => assert(type(val)(units) == _type, `Field "${name}" should contain ${_type}s!`));
        if (_type == 'number') {
            raw = raw.map(val => mathnum(val)(units));
        }
        return raw
    };

    const numarr = assert$1.numarr = (raw, name, length) => units => arr(raw, name, length, 'number', 0)(units);
    assert$1.strarr = (raw, name) => arr(raw, name, 0, 'string', '')();

    const xy = assert$1.xy = (raw, name) => units => numarr(raw, name, 2)(units);

    assert$1.wh = (raw, name) => units => {
        if (!Array.isArray(raw)) raw = [raw, raw];
        return xy(raw, name)(units)
    };

    assert$1.trbl = (raw, name) => units => {
        if (!Array.isArray(raw)) raw = [raw, raw, raw, raw];
        if (raw.length == 2) raw = [raw[1], raw[0], raw[1], raw[0]];
        return numarr(raw, name, 4, 'number', 0)(units)
    };

    var kle$2 = {};

    const u$5 = utils;
    const kle$1 = require$$1__default["default"];
    const yaml$1 = require$$2__default["default"];

    kle$2.convert = (config, logger) => {
        const keyboard = kle$1.Serial.deserialize(config);
        const result = {points: {zones: {}}, pcbs: {main: {}}};

        // if the keyboard notes are valid YAML/JSON, they get added to each key as metadata
        let meta;
        try {
            meta = yaml$1.load(keyboard.meta.notes);
        } catch (ex) {
            // notes were not valid YAML/JSON, oh well...
        }
        meta = meta || {};

        let index = 1;
        for (const key of keyboard.keys) {
            const id = `key${index++}`;
            const colid = `${id}col`;
            const rowid = `${id}row`;
            // we try to look at the first non-empty label
            const label = key.labels.filter(e => !!e)[0] || ''; 

            // PCB nets can be specified through key labels
            let row_net = id;
            let col_net = 'GND';
            if (label.match(/^\d+_\d+$/)) {
                const parts = label.split('_');
                row_net = `row_${parts[0]}`;
                col_net = `col_${parts[1]}`;
            }

            // need to account for keycap sizes, as KLE anchors
            // at the corners, while we consider the centers
            const x = key.x + (key.width - 1) / 2;
            const y = key.y + (key.height - 1) / 2;
            
            // KLE deals in absolute rotation origins so we calculate
            // a relative difference as an origin for the column rotation
            // again, considering corner vs. center with the extra half width/height
            const diff_x = key.rotation_x - (key.x + key.width / 2);
            const diff_y = key.rotation_y - (key.y + key.height / 2);

            // anchoring the per-key zone to the KLE-computed coords
            const converted = {
                anchor: {
                    shift: [`${x} u`, `${-y} u`],
                },
                columns: {}
            };
            
            // adding a column-level rotation with origin
            converted.columns[colid] = {
                rotate: -key.rotation_angle,
                origin: [`${diff_x} u`, `${-diff_y} u`],
                rows: {}
            };
            
            // passing along metadata to each key
            converted.columns[colid].rows[rowid] = u$5.deepcopy(meta);
            converted.columns[colid].rows[rowid].width = key.width;
            converted.columns[colid].rows[rowid].height = key.height;
            converted.columns[colid].rows[rowid].label = label;
            converted.columns[colid].rows[rowid].column_net = col_net;
            converted.columns[colid].rows[rowid].row_net = row_net;
            
            result.points.zones[id] = converted;
        }

        return result
    };

    const yaml = require$$2__default["default"];
    const makerjs = require$$0__default["default"];
    const jscad = require$$2__default$1["default"];

    const u$4 = utils;
    const a$7 = assert$1;
    const kle = kle$2;

    io$1.interpret = (raw, logger) => {
        let config = raw;
        let format = 'OBJ';
        if (a$7.type(raw)() == 'string') {
            try {
                config = yaml.safeLoad(raw);
                format = 'YAML';
            } catch (yamlex) {
                try {
                    config = new Function(raw)();
                    a$7.assert(
                        a$7.type(config)() == 'object',
                        'Input JS Code doesn\'t resolve into an object!'
                    );
                    format = 'JS';
                } catch (codeex) {
                    logger('YAML exception:', yamlex);
                    logger('Code exception:', codeex);
                    throw new Error('Input is not valid YAML, JSON, or JS Code!')
                }
            }
        }
        
        try {
            // assume it's KLE and try to convert it
            config = kle.convert(config, logger);
            format = 'KLE';
        } catch (kleex) {
            // nope... nevermind
        }

        if (a$7.type(config)() != 'object') {
            throw new Error('Input doesn\'t resolve into an object!')
        }

        if (!Object.keys(config).length) {
            throw new Error('Input appears to be empty!')
        }

        return [config, format]
    };

    io$1.twodee = (model, debug) => {
        const assembly = makerjs.model.originate({
            models: {
                export: u$4.deepcopy(model)
            },
            units: 'mm'
        });

        const result = {
            dxf: makerjs.exporter.toDXF(assembly),
        };
        if (debug) {
            result.yaml = assembly;
            result.svg = makerjs.exporter.toSVG(assembly);
        }
        return result
    };

    io$1.threedee = async (script, debug) => {
        const compiled = await new Promise((resolve, reject) => {
            jscad.compile(script, {}).then(compiled => {
                resolve(compiled);
            });
        });
        const result = {
            stl: jscad.generateOutput('stla', compiled).asBuffer().toString()
        };
        if (debug) {
            result.jscad = script;
        }
        return result
    };

    var prepare$1 = {};

    const u$3 = utils;
    const a$6 = assert$1;

    const _extend = prepare$1._extend = (to, from) => {
        const to_type = a$6.type(to)();
        const from_type = a$6.type(from)();
        if (from === undefined || from === null) return to
        if (from === '$unset') return undefined
        if (to_type != from_type) return from
        if (from_type == 'object') {
            const res = u$3.deepcopy(to);
            for (const key of Object.keys(from)) {
                res[key] = _extend(to[key], from[key]);
                if (res[key] === undefined) delete res[key];
            }
            return res
        } else if (from_type == 'array') {
            const res = u$3.deepcopy(to);
            for (const [i, val] of from.entries()) {
                res[i] = _extend(res[i], val);
            }
            return res
        } else return from
    };

    const extend = prepare$1.extend = (...args) => {
        let res = args[0];
        for (const arg of args) {
            if (res == arg) continue
            res = _extend(res, arg);
        }
        return res
    };

    const traverse = prepare$1.traverse = (config, root, breadcrumbs, op) => {
        if (a$6.type(config)() == 'object') {
            const result = {};
            for (const [key, val] of Object.entries(config)) {
                breadcrumbs.push(key);
                op(result, key, traverse(val, root, breadcrumbs, op), root, breadcrumbs);
                breadcrumbs.pop();
            }
            return result
        } else if (a$6.type(config)() == 'array') {
            const result = [];
            let index = 0;
            for (const val of config) {
                breadcrumbs.push(`[${index}]`);
                result[index] = traverse(val, root, breadcrumbs, op);
                breadcrumbs.pop();
                index++;
            }
            return result
        }
        return config
    };

    prepare$1.unnest = config => traverse(config, config, [], (target, key, val) => {
        u$3.deep(target, key, val);
    });

    prepare$1.inherit = config => traverse(config, config, [], (target, key, val, root, breadcrumbs) => {
        if (val && val.$extends !== undefined) {
            let candidates = u$3.deepcopy(val.$extends);
            if (a$6.type(candidates)() !== 'array') candidates = [candidates];
            const list = [val];
            while (candidates.length) {
                const path = candidates.shift();
                const other = u$3.deepcopy(u$3.deep(root, path));
                a$6.assert(other, `"${path}" (reached from "${breadcrumbs.join('.')}.$extends") does not name a valid inheritance target!`);
                let parents = other.$extends || [];
                if (a$6.type(parents)() !== 'array') parents = [parents];
                candidates = candidates.concat(parents);
                list.unshift(other);
            }
            val = extend.apply(undefined, list);
            delete val.$extends;
        }
        target[key] = val;
    });

    prepare$1.parameterize = config => traverse(config, config, [], (target, key, val, root, breadcrumbs) => {
        let params = val.$params;
        let args = val.$args;

        // explicitly skipped (probably intermediate) template, remove (by not setting it)
        if (val.$skip) return

        // nothing to do here, just pass the original value through
        if (!params && !args) {
            target[key] = val;
            return
        }

        // unused template, remove (by not setting it)
        if (params && !args) return

        if (!params && args) {
            throw new Error(`Trying to parameterize through "${breadcrumbs}.$args", but the corresponding "$params" field is missing!`)
        }

        params = a$6.strarr(params, `${breadcrumbs}.$params`);
        args = a$6.sane(args, `${breadcrumbs}.$args`, 'array')();
        if (params.length !== args.length) {
            throw new Error(`The number of "$params" and "$args" don't match for "${breadcrumbs}"!`)
        }

        let str = JSON.stringify(val);
        const zip = rows => rows[0].map((_, i) => rows.map(row => row[i]));
        for (const [par, arg] of zip([params, args])) {
            str = str.replace(new RegExp(`"${par}"`, 'g'), JSON.stringify(arg));
        }
        try {
            val = JSON.parse(str);
        } catch (ex) {
            throw new Error(`Replacements didn't lead to a valid JSON object at "${breadcrumbs}"! ` + ex)
        }

        delete val.$params;
        delete val.$args;
        target[key] = val;
    });

    var units = {};

    const a$5 = assert$1;
    const prep$3 = prepare$1;

    const default_units = {
        U: 19.05,
        u: 19,
        cx: 18,
        cy: 17
    };

    units.parse = (config = {}) => {
        const raw_units = prep$3.extend(
            default_units,
            a$5.sane(config.units || {}, 'units', 'object')(),
            a$5.sane(config.variables || {}, 'variables', 'object')()
        );
        const units = {};
        for (const [key, val] of Object.entries(raw_units)) {
            units[key] = a$5.mathnum(val)(units);
        }
        return units
    };

    var points = {};

    var anchor$1 = {};

    const a$4 = assert$1;
    const Point$1 = point;

    const mirror_ref = anchor$1.mirror = (ref, mirror) => {
        if (mirror) {
            if (ref.startsWith('mirror_')) {
                return ref.substring(7)
            } else {
                return 'mirror_' + ref
            }
        }
        return ref
    };

    const anchor = anchor$1.parse = (raw, name, points={}, check_unexpected=true, default_point=new Point$1(), mirror=false) => units => {
        if (a$4.type(raw)() == 'array') {
            // recursive call with incremental default_point mods, according to `affect`s
            let current = default_point.clone();
            for (const step of raw) {
                current = anchor(step, name, points, check_unexpected, current, mirror)(units);
            }
            return current
        }
        if (check_unexpected) a$4.unexpected(raw, name, ['ref', 'orient', 'shift', 'rotate', 'affect']);
        let point = default_point.clone();
        if (raw.ref !== undefined) {
            if (a$4.type(raw.ref)() == 'array') {
                // averaging multiple anchors
                let x = 0, y = 0, r = 0;
                const len = raw.ref.length;
                for (const ref of raw.ref) {
                    const parsed_ref = mirror_ref(ref, mirror);
                    a$4.assert(points[parsed_ref], `Unknown point reference "${parsed_ref}" in anchor "${name}"!`);
                    const resolved = points[parsed_ref];
                    x += resolved.x;
                    y += resolved.y;
                    r += resolved.r;
                }
                point = new Point$1(x / len, y / len, r / len);
            } else {
                const parsed_ref = mirror_ref(raw.ref, mirror);
                a$4.assert(points[parsed_ref], `Unknown point reference "${parsed_ref}" in anchor "${name}"!`);
                point = points[parsed_ref].clone();
            }
        }
        if (raw.orient !== undefined) {
            let angle = a$4.sane(raw.orient, `${name}.orient`, 'number')(units);
            if (point.meta.mirrored) {
                angle = -angle;
            } 
            point.r += angle;
        }
        if (raw.shift !== undefined) {
            let xyval = a$4.wh(raw.shift, `${name}.shift`)(units);
            if (point.meta.mirrored) {
                xyval[0] = -xyval[0];
            }
            point.shift(xyval, true);
        }
        if (raw.rotate !== undefined) {
            let angle = a$4.sane(raw.rotate, `${name}.rotate`, 'number')(units);
            if (point.meta.mirrored) {
                angle = -angle;
            } 
            point.r += angle;
        }
        if (raw.affect !== undefined) {
            const candidate = point.clone();
            point = default_point.clone();
            point.meta = candidate.meta;
            let affect = raw.affect;
            if (a$4.type(affect)() == 'string') affect = affect.split('');
            affect = a$4.strarr(affect, `${name}.affect`);
            let i = 0;
            for (const aff of affect) {
                a$4.in(aff, `${name}.affect[${++i}]`, ['x', 'y', 'r']);
                point[aff] = candidate[aff];
            }
        }
        return point
    };

    const m$3 = require$$0__default["default"];
    const u$2 = utils;
    const a$3 = assert$1;
    const prep$2 = prepare$1;
    const anchor_lib$2 = anchor$1;

    const push_rotation = points._push_rotation = (list, angle, origin) => {
        let candidate = origin;
        for (const r of list) {
            candidate = m$3.point.rotate(candidate, r.angle, r.origin);
        }
        list.push({
            angle: angle,
            origin: candidate
        });
    };

    const render_zone = points._render_zone = (zone_name, zone, anchor, global_key, units) => {

        // zone-wide sanitization

        a$3.unexpected(zone, `points.zones.${zone_name}`, ['columns', 'rows', 'key']);
        // the anchor comes from "above", because it needs other zones too (for references)
        const cols = a$3.sane(zone.columns || {}, `points.zones.${zone_name}.columns`, 'object')();
        const zone_wide_rows = a$3.sane(zone.rows || {}, `points.zones.${zone_name}.rows`, 'object')();
        for (const [key, val] of Object.entries(zone_wide_rows)) {
            zone_wide_rows[key] = a$3.sane(val || {}, `points.zones.${zone_name}.rows.${key}`, 'object')();
        }
        const zone_wide_key = a$3.sane(zone.key || {}, `points.zones.${zone_name}.key`, 'object')();

        // algorithm prep

        const points = {};
        const rotations = [];
        // transferring the anchor rotation to "real" rotations
        rotations.push({
            angle: anchor.r,
            origin: anchor.p
        });

        // column layout

        if (!Object.keys(cols).length) {
            cols.default = {};
        }
        let first_col = true;
        for (let [col_name, col] of Object.entries(cols)) {

            // column-level sanitization

            col = col || {};

            a$3.unexpected(
                col,
                `points.zones.${zone_name}.columns.${col_name}`,
                ['stagger', 'spread', 'rotate', 'origin', 'rows', 'row_overrides', 'key']
            );
            col.stagger = a$3.sane(
                col.stagger || 0,
                `points.zones.${zone_name}.columns.${col_name}.stagger`,
                'number'
            )(units);
            col.spread = a$3.sane(
                col.spread !== undefined ? col.spread : (first_col ? 0 : 'u'),
                `points.zones.${zone_name}.columns.${col_name}.spread`,
                'number'
            )(units);
            col.rotate = a$3.sane(
                col.rotate || 0,
                `points.zones.${zone_name}.columns.${col_name}.rotate`,
                'number'
            )(units);
            col.origin = a$3.xy(
                col.origin || [0, 0],
                `points.zones.${zone_name}.columns.${col_name}.origin`
            )(units);
            let override = false;
            col.rows = a$3.sane(
                col.rows || {},
                `points.zones.${zone_name}.columns.${col_name}.rows`,
                'object'
            )();
            if (col.row_overrides) {
                override = true;
                col.rows = a$3.sane(
                    col.row_overrides,
                    `points.zones.${zone_name}.columns.${col_name}.row_overrides`,
                    'object'
                )();
            }
            for (const [key, val] of Object.entries(col.rows)) {
                col.rows[key] = a$3.sane(
                    val || {},
                    `points.zones.${zone_name}.columns.${col_name}.rows.${key}`,
                    'object'
                )();
            }
            col.key = a$3.sane(
                col.key || {},
                `points.zones.${zone_name}.columns.${col_name}.key`,
                'object'
            )();

            // propagating object key to name field

            col.name = col_name;

            // combining row data from zone-wide defs and col-specific defs
            // (while also handling potential overrides)

            const actual_rows = override ? Object.keys(col.rows)
                : Object.keys(prep$2.extend(zone_wide_rows, col.rows));
            if (!actual_rows.length) {
                actual_rows.push('default');
            }

            // setting up column-level anchor

            anchor.x += col.spread;
            anchor.y += col.stagger;
            const col_anchor = anchor.clone();
            // clear potential rotations, as they will get re-applied anyway
            // and we don't want to apply them twice...
            col_anchor.r = 0;

            // applying col-level rotation (cumulatively, for the next columns as well)

            if (col.rotate) {
                push_rotation(
                    rotations,
                    col.rotate,
                    col_anchor.clone().shift(col.origin, false).p
                );
            }

            // getting key config through the 5-level extension

            const keys = [];
            const default_key = {
                shift: [0, 0],
                rotate: 0,
                padding: 'u',
                width: 1,
                height: 1,
                skip: false,
                asym: 'both'
            };
            for (const row of actual_rows) {
                const key = prep$2.extend(
                    default_key,
                    global_key,
                    zone_wide_key,
                    col.key,
                    zone_wide_rows[row] || {},
                    col.rows[row] || {}
                );

                key.name = key.name || `${zone_name}_${col_name}_${row}`;
                key.colrow = `${col_name}_${row}`;
                key.shift = a$3.xy(key.shift, `${key.name}.shift`)(units);
                key.rotate = a$3.sane(key.rotate, `${key.name}.rotate`, 'number')(units);
                key.width = a$3.sane(key.width, `${key.name}.width`, 'number')(units);
                key.height = a$3.sane(key.height, `${key.name}.height`, 'number')(units);
                key.padding = a$3.sane(key.padding, `${key.name}.padding`, 'number')(units);
                key.skip = a$3.sane(key.skip, `${key.name}.skip`, 'boolean')();
                key.asym = a$3.in(key.asym, `${key.name}.asym`, ['left', 'right', 'both']);
                key.col = col;
                key.row = row;
                keys.push(key);
            }

            // actually laying out keys

            for (const key of keys) {
                let point = col_anchor.clone();
                for (const r of rotations) {
                    point.rotate(r.angle, r.origin);
                }
                point.shift(key.shift);
                point.r += key.rotate;
                point.meta = key;
                points[key.name] = point;
                col_anchor.y += key.padding;
            }

            first_col = false;
        }

        return points
    };

    const parse_axis = points._parse_axis = (config, name, points, units) => {
        if (!['number', 'undefined'].includes(a$3.type(config)(units))) {
            const mirror_obj = a$3.sane(config || {}, name, 'object')();
            const distance = a$3.sane(mirror_obj.distance || 0, `${name}.distance`, 'number')(units);
            delete mirror_obj.distance;
            let axis = anchor_lib$2.parse(mirror_obj, name, points)(units).x;
            axis += distance / 2;
            return axis
        } else return config
    };

    const perform_mirror = points._perform_mirror = (point, axis) => {
        if (axis !== undefined) {
            point.meta.mirrored = false;
            if (point.meta.asym == 'left') return ['', null]
            const mp = point.clone().mirror(axis);
            const mirrored_name = `mirror_${point.meta.name}`;
            mp.meta = prep$2.extend(mp.meta, mp.meta.mirror || {});
            mp.meta.name = mirrored_name;
            mp.meta.colrow = `mirror_${mp.meta.colrow}`;
            mp.meta.mirrored = true;
            if (point.meta.asym == 'right') {
                point.meta.skip = true;
            }
            return [mirrored_name, mp]
        }
        return ['', null]
    };

    points.parse = (config, units) => {

        // config sanitization
        a$3.unexpected(config, 'points', ['zones', 'key', 'rotate', 'mirror']);
        const zones = a$3.sane(config.zones, 'points.zones', 'object')();
        const global_key = a$3.sane(config.key || {}, 'points.key', 'object')();
        const global_rotate = a$3.sane(config.rotate || 0, 'points.rotate', 'number')(units);
        const global_mirror = config.mirror;
        let points = {};
        let mirrored_points = {};
        let all_points = {};


        // rendering zones
        for (let [zone_name, zone] of Object.entries(zones)) {

            // extracting keys that are handled here, not at the zone render level
            const anchor = anchor_lib$2.parse(zone.anchor || {}, `points.zones.${zone_name}.anchor`, all_points)(units);
            const rotate = a$3.sane(zone.rotate || 0, `points.zones.${zone_name}.rotate`, 'number')(units);
            const mirror = zone.mirror;
            delete zone.anchor;
            delete zone.rotate;
            delete zone.mirror;

            // creating new points
            const new_points = render_zone(zone_name, zone, anchor, global_key, units);

            // adjusting new points
            for (const [new_name, new_point] of Object.entries(new_points)) {
                
                // issuing a warning for duplicate keys
                if (Object.keys(points).includes(new_name)) {
                    throw new Error(`Key "${new_name}" defined more than once!`)
                }

                // per-zone rotation
                if (rotate) {
                    new_point.rotate(rotate);
                }
            }

            // adding new points so that they can be referenced from now on
            points = Object.assign(points, new_points);
            all_points = Object.assign(all_points, points);

            // per-zone mirroring for the new keys
            const axis = parse_axis(mirror, `points.zones.${zone_name}.mirror`, all_points, units);
            if (axis) {
                for (const new_point of Object.values(new_points)) {
                    const [mname, mp] = perform_mirror(new_point, axis);
                    if (mp) {
                        mirrored_points[mname] = mp;
                        all_points[mname] = mp;
                    }
                }
            }
        }

        // merging regular and early-mirrored points
        points = Object.assign(points, mirrored_points);

        // applying global rotation
        for (const point of Object.values(points)) {
            if (global_rotate) {
                point.rotate(global_rotate);
            }
        }

        // global mirroring for points that haven't been mirrored yet
        const global_axis = parse_axis(global_mirror, `points.mirror`, points, units);
        const global_mirrored_points = {};
        for (const point of Object.values(points)) {
            if (global_axis && point.mirrored === undefined) {
                const [mname, mp] = perform_mirror(point, global_axis);
                if (mp) {
                    global_mirrored_points[mname] = mp;
                }
            }
        }

        // merging the global-mirrored points as well
        points = Object.assign(points, global_mirrored_points);

        // removing temporary points
        const filtered = {};
        for (const [k, p] of Object.entries(points)) {
            if (p.meta.skip) continue
            filtered[k] = p;
        }

        // done
        return filtered
    };

    points.visualize = (points, units) => {
        const models = {};
        const x_unit = units.visual_x || (units.u - 1);
        const y_unit = units.visual_y || (units.u - 1);
        for (const [pname, p] of Object.entries(points)) {
            const w = p.meta.width * x_unit;
            const h = p.meta.height * y_unit;
            const rect = u$2.rect(w, h, [-w/2, -h/2]);
            models[pname] = p.position(rect);
        }
        return {models: models}
    };

    var outlines = {};

    var operation = {};

    const op_prefix = operation.op_prefix = str => {
        const suffix = str.slice(1);
        if (str.startsWith('+')) return {name: suffix, operation: 'add'}
        if (str.startsWith('-')) return {name: suffix, operation: 'subtract'}
        if (str.startsWith('~')) return {name: suffix, operation: 'intersect'}
        if (str.startsWith('^')) return {name: suffix, operation: 'stack'}
        return {name: str, operation: 'add'}
    };

    operation.operation = (str, choices={}, order=Object.keys(choices)) => {
        let res = op_prefix(str);
        for (const key of order) {
            if (choices[key].includes(res.name)) {
                res.type = key;
                break
            }
        }
        return res
    };

    const m$2 = require$$0__default["default"];
    const u$1 = utils;
    const a$2 = assert$1;
    const o$1 = operation;
    const Point = point;
    const prep$1 = prepare$1;
    const anchor_lib$1 = anchor$1;

    const rectangle = (w, h, corner, bevel, name='') => {
        const error = (dim, val) => `Rectangle for "${name}" isn't ${dim} enough for its corner and bevel (${val} - 2 * ${corner} - 2 * ${bevel} <= 0)!`;
        const mod = 2 * (corner + bevel);
        const cw = w - mod;
        a$2.assert(cw >= 0, error('wide', w));
        const ch = h - mod;
        a$2.assert(ch >= 0, error('tall', h));

        let res = new m$2.models.Rectangle(cw, ch);
        if (bevel) {
            res = u$1.poly([
                [-bevel, 0],
                [-bevel, ch],
                [0, ch + bevel],
                [cw, ch + bevel],
                [cw + bevel, ch],
                [cw + bevel, 0],
                [cw, -bevel],
                [0, -bevel]
            ]);
        }
        if (corner > 0) res = m$2.model.outline(res, corner, 0);
        return m$2.model.moveRelative(res, [corner + bevel, corner + bevel])
    };

    const layout = outlines._layout = (config = {}, points = {}, units = {}) => {

        // Glue config sanitization

        const parsed_glue = u$1.deepcopy(a$2.sane(config, 'outlines.glue', 'object')());
        for (let [gkey, gval] of Object.entries(parsed_glue)) {
            a$2.unexpected(gval, `outlines.glue.${gkey}`, ['top', 'bottom', 'waypoints', 'extra']);
        
            for (const y of ['top', 'bottom']) {
                a$2.unexpected(gval[y], `outlines.glue.${gkey}.${y}`, ['left', 'right']);
                gval[y].left = anchor_lib$1.parse(gval[y].left, `outlines.glue.${gkey}.${y}.left`, points);
                if (a$2.type(gval[y].right)(units) != 'number') {
                    gval[y].right = anchor_lib$1.parse(gval[y].right, `outlines.glue.${gkey}.${y}.right`, points);
                }
            }
        
            gval.waypoints = a$2.sane(gval.waypoints || [], `outlines.glue.${gkey}.waypoints`, 'array')(units);
            let wi = 0;
            gval.waypoints = gval.waypoints.map(w => {
                const name = `outlines.glue.${gkey}.waypoints[${++wi}]`;
                a$2.unexpected(w, name, ['percent', 'width']);
                w.percent = a$2.sane(w.percent, name + '.percent', 'number')(units);
                w.width = a$2.wh(w.width, name + '.width')(units);
                return w
            });

            parsed_glue[gkey] = gval;
        }


        // TODO: handle glue.extra (or revoke it from the docs)

        return (params, export_name, expected) => {

            // Layout params sanitization

            a$2.unexpected(params, `${export_name}`, expected.concat(['side', 'tags', 'glue', 'size', 'corner', 'bevel', 'bound']));
            const size = a$2.wh(params.size, `${export_name}.size`)(units);
            const relative_units = prep$1.extend({
                sx: size[0],
                sy: size[1]
            }, units);



            const side = a$2.in(params.side, `${export_name}.side`, ['left', 'right', 'middle', 'both', 'glue']);
            const tags = a$2.sane(params.tags || [], `${export_name}.tags`, 'array')();
            const corner = a$2.sane(params.corner || 0, `${export_name}.corner`, 'number')(relative_units);
            const bevel = a$2.sane(params.bevel || 0, `${export_name}.bevel`, 'number')(relative_units);
            const bound = a$2.sane(params.bound === undefined ? true : params.bound, `${export_name}.bound`, 'boolean')();

            // Actual layout

            let left = {models: {}};
            let right = {models: {}};
            if (['left', 'right', 'middle', 'both'].includes(side)) {
                for (const [pname, p] of Object.entries(points)) {

                    // filter by tags, if necessary
                    if (tags.length) {
                        const source = p.meta.tags || {};
                        const point_tags = Object.keys(source).filter(t => !!source[t]);
                        const relevant = point_tags.some(pt => tags.includes(pt));
                        if (!relevant) continue
                    }

                    let from_x = -size[0] / 2, to_x = size[0] / 2;
                    let from_y = -size[1] / 2, to_y = size[1] / 2;

                    // the original position
                    let rect = rectangle(to_x - from_x, to_y - from_y, corner, bevel, `${export_name}.size`);
                    rect = m$2.model.moveRelative(rect, [from_x, from_y]);

                    // extra binding "material", if necessary
                    if (bound) {
                        let bind = a$2.trbl(p.meta.bind || 0, `${pname}.bind`)(relative_units);
                        // if it's a mirrored key, we swap the left and right bind values
                        if (p.meta.mirrored) {
                            bind = [bind[0], bind[3], bind[2], bind[1]];
                        }
        
                        const bt = to_y + Math.max(bind[0], 0);
                        const br = to_x + Math.max(bind[1], 0);
                        const bd = from_y - Math.max(bind[2], 0);
                        const bl = from_x - Math.max(bind[3], 0);
        
                        if (bind[0] || bind[1]) rect = u$1.union(rect, u$1.rect(br, bt));
                        if (bind[1] || bind[2]) rect = u$1.union(rect, u$1.rect(br, -bd, [0, bd]));
                        if (bind[2] || bind[3]) rect = u$1.union(rect, u$1.rect(-bl, -bd, [bl, bd]));
                        if (bind[3] || bind[0]) rect = u$1.union(rect, u$1.rect(-bl, bt, [bl, 0]));
                    }
                    
                    // positioning and unioning the resulting shape
                    rect = p.position(rect);
                    if (p.meta.mirrored) {
                        right = u$1.union(right, rect);
                    } else {
                        left = u$1.union(left, rect);
                    }
                }
            }
            if (side == 'left') return left
            if (side == 'right') return right

            // allow opting out of gluing, when
            // A) there are no glue definitions, or
            // B) glue is explicitly set to false
            const glue_opt_out = (!Object.keys(parsed_glue).length || params.glue === false);

            let glue = {models: {}};
            if (bound && ['middle', 'both', 'glue'].includes(side) && !glue_opt_out) {

                const default_glue_name = Object.keys(parsed_glue)[0];
                const computed_glue_name = a$2.sane(params.glue || default_glue_name, `${export_name}.glue`, 'string')();
                const glue_def = parsed_glue[computed_glue_name];
                a$2.assert(glue_def, `Field "${export_name}.glue" does not name a valid glue!`);

                const get_line = (anchor) => {
                    if (a$2.type(anchor)(relative_units) == 'number') {
                        return u$1.line([anchor, -1000], [anchor, 1000])
                    }

                    // if it wasn't a number, then it's a (possibly relative) anchor
                    const from = anchor(relative_units).clone();
                    const to = from.clone().shift([from.meta.mirrored ? -1 : 1, 0]);

                    return u$1.line(from.p, to.p)
                };

                const tll = get_line(glue_def.top.left);
                const trl = get_line(glue_def.top.right);
                const tip = m$2.path.converge(tll, trl);
                if (!tip) {
                    throw new Error(`Top lines don't intersect in glue "${computed_glue_name}"!`)
                }
                const tlp = u$1.eq(tll.origin, tip) ? tll.end : tll.origin;
                const trp = u$1.eq(trl.origin, tip) ? trl.end : trl.origin;
        
                const bll = get_line(glue_def.bottom.left);
                const brl = get_line(glue_def.bottom.right);
                const bip = m$2.path.converge(bll, brl);
                if (!bip) {
                    throw new Error(`Bottom lines don't intersect in glue "${computed_glue_name}"!`)
                }
                const blp = u$1.eq(bll.origin, bip) ? bll.end : bll.origin;
                const brp = u$1.eq(brl.origin, bip) ? brl.end : brl.origin;
        
                const left_waypoints = [];
                const right_waypoints = [];

                for (const w of glue_def.waypoints) {
                    const percent = w.percent / 100;
                    const center_x = tip[0] + percent * (bip[0] - tip[0]);
                    const center_y = tip[1] + percent * (bip[1] - tip[1]);
                    const left_x = center_x - w.width[0];
                    const right_x = center_x + w.width[1];
                    left_waypoints.push([left_x, center_y]);
                    right_waypoints.unshift([right_x, center_y]);
                }
                
                let waypoints;
                const is_split = a$2.type(glue_def.top.right)(relative_units) == 'number';
                if (is_split) {
                    waypoints = [tip, tlp]
                    .concat(left_waypoints)
                    .concat([blp, bip]);
                } else {
                    waypoints = [trp, tip, tlp]
                    .concat(left_waypoints)
                    .concat([blp, bip, brp])
                    .concat(right_waypoints);
                }

                glue = u$1.poly(waypoints);
            }
            if (side == 'glue') return glue

            if (side == 'middle') {
                let middle = u$1.subtract(glue, left);
                middle = u$1.subtract(middle, right);
                return middle
            }

            let both = u$1.union(u$1.deepcopy(left), glue);
            both = u$1.union(both, u$1.deepcopy(right));
            return both
        }
    };

    outlines.parse = (config = {}, points = {}, units = {}) => {
        a$2.unexpected(config, 'outline', ['glue', 'exports']);
        const layout_fn = layout(config.glue, points, units);

        const outlines = {};

        const ex = a$2.sane(config.exports || {}, 'outlines.exports', 'object')();
        for (let [key, parts] of Object.entries(ex)) {
            if (a$2.type(parts)() == 'array') {
                parts = {...parts};
            }
            parts = a$2.sane(parts, `outlines.exports.${key}`, 'object')();
            let result = {models: {}};
            for (let [part_name, part] of Object.entries(parts)) {
                const name = `outlines.exports.${key}.${part_name}`;
                if (a$2.type(part)() == 'string') {
                    part = o$1.operation(part, {outline: Object.keys(outlines)});
                }
                const expected = ['type', 'operation'];
                part.type = a$2.in(part.type || 'outline', `${name}.type`, ['keys', 'rectangle', 'circle', 'polygon', 'outline']);
                part.operation = a$2.in(part.operation || 'add', `${name}.operation`, ['add', 'subtract', 'intersect', 'stack']);

                let op = u$1.union;
                if (part.operation == 'subtract') op = u$1.subtract;
                else if (part.operation == 'intersect') op = u$1.intersect;
                else if (part.operation == 'stack') op = u$1.stack;

                let arg;
                let anchor;
                const anchor_def = part.anchor || {};
                switch (part.type) {
                    case 'keys':
                        arg = layout_fn(part, name, expected);
                        break
                    case 'rectangle':
                        a$2.unexpected(part, name, expected.concat(['anchor', 'size', 'corner', 'bevel', 'mirror']));
                        const size = a$2.wh(part.size, `${name}.size`)(units);
                        const rec_units = prep$1.extend({
                            sx: size[0],
                            sy: size[1]
                        }, units);
                        anchor = anchor_lib$1.parse(anchor_def, `${name}.anchor`, points)(rec_units);
                        const corner = a$2.sane(part.corner || 0, `${name}.corner`, 'number')(rec_units);
                        const bevel = a$2.sane(part.bevel || 0, `${name}.bevel`, 'number')(rec_units);
                        const rect_mirror = a$2.sane(part.mirror || false, `${name}.mirror`, 'boolean')();
                        const rect = rectangle(size[0], size[1], corner, bevel, name);
                        arg = anchor.position(u$1.deepcopy(rect));
                        if (rect_mirror) {
                            const mirror_anchor = u$1.deepcopy(anchor_def);
                            a$2.assert(mirror_anchor.ref, `Field "${name}.anchor.ref" must be speficied if mirroring is required!`);
                            anchor = anchor_lib$1.parse(mirror_anchor, `${name}.anchor --> mirror`, points, undefined, undefined, true)(rec_units);
                            const mirror_rect = m$2.model.moveRelative(u$1.deepcopy(rect), [-size[0], 0]);
                            arg = u$1.union(arg, anchor.position(mirror_rect));
                        }
                        break
                    case 'circle':
                        a$2.unexpected(part, name, expected.concat(['anchor', 'radius', 'mirror']));
                        const radius = a$2.sane(part.radius, `${name}.radius`, 'number')(units);
                        const circle_units = prep$1.extend({
                            r: radius
                        }, units);
                        anchor = anchor_lib$1.parse(anchor_def, `${name}.anchor`, points)(circle_units);
                        const circle_mirror = a$2.sane(part.mirror || false, `${name}.mirror`, 'boolean')();
                        arg = u$1.circle(anchor.p, radius);
                        if (circle_mirror) {
                            const mirror_anchor = u$1.deepcopy(anchor_def);
                            a$2.assert(mirror_anchor.ref, `Field "${name}.anchor.ref" must be speficied if mirroring is required!`);
                            anchor = anchor_lib$1.parse(mirror_anchor, `${name}.anchor --> mirror`, points, undefined, undefined, true)(circle_units);
                            arg = u$1.union(arg, u$1.circle(anchor.p, radius));
                        }
                        break
                    case 'polygon':
                        a$2.unexpected(part, name, expected.concat(['points', 'mirror']));
                        const poly_points = a$2.sane(part.points, `${name}.points`, 'array')();
                        const poly_mirror = a$2.sane(part.mirror || false, `${name.mirror}`, 'boolean')();
                        const parsed_points = [];
                        const mirror_points = [];
                        let poly_mirror_x = 0;
                        let last_anchor = new Point();
                        let poly_index = 0;
                        for (const poly_point of poly_points) {
                            const poly_name = `${name}.points[${++poly_index}]`;
                            if (poly_index == 1 && poly_mirror) {
                                a$2.assert(poly_point.ref, `Field "${poly_name}.ref" must be speficied if mirroring is required!`);
                                const mirrored_ref = anchor_lib$1.mirror(poly_point.ref, poly_mirror);
                                a$2.assert(points[poly_point.ref], `Field "${poly_name}.ref" does not name an existing point!`);
                                a$2.assert(points[mirrored_ref], `The mirror of field "${poly_name}.ref" ("${mirrored_ref}") does not name an existing point!`);
                                poly_mirror_x = (points[poly_point.ref].x + points[mirrored_ref].x) / 2;
                            }
                            last_anchor = anchor_lib$1.parse(poly_point, poly_name, points, true, last_anchor)(units);
                            parsed_points.push(last_anchor.p);
                            mirror_points.push(last_anchor.clone().mirror(poly_mirror_x).p);
                        }
                        arg = u$1.poly(parsed_points);
                        if (poly_mirror) {
                            arg = u$1.union(arg, u$1.poly(mirror_points));
                        }
                        break
                    case 'outline':
                        a$2.unexpected(part, name, expected.concat(['name', 'fillet']));
                        a$2.assert(outlines[part.name], `Field "${name}.name" does not name an existing outline!`);
                        const fillet = a$2.sane(part.fillet || 0, `${name}.fillet`, 'number')(units);
                        arg = u$1.deepcopy(outlines[part.name]);
                        if (fillet) {
                            for (const [index, chain] of m$2.model.findChains(arg).entries()) {
                                arg.models[`fillet_${index}`] = m$2.chain.fillet(chain, fillet);
                            }
                        }
                        break
                    default:
                        throw new Error(`Field "${name}.type" (${part.type}) does not name a valid outline part type!`)
                }

                result = op(result, arg);
            }

            m$2.model.originate(result);
            m$2.model.simplify(result);
            outlines[key] = result;
        }

        return outlines
    };

    var cases = {};

    const m$1 = require$$0__default["default"];
    const a$1 = assert$1;
    const o = operation;

    cases.parse = (config, outlines, units) => {

        const cases_config = a$1.sane(config, 'cases', 'object')();

        const scripts = {};
        const cases = {};
        const results = {};

        const resolve = (case_name, resolved_scripts=new Set(), resolved_cases=new Set()) => {
            for (const o of Object.values(cases[case_name].outline_dependencies)) {
                resolved_scripts.add(o);
            }
            for (const c of Object.values(cases[case_name].case_dependencies)) {
                resolved_cases.add(c);
                resolve(c, resolved_scripts, resolved_cases);
            }
            const result = [];
            for (const o of resolved_scripts) {
                result.push(scripts[o] + '\n\n');
            }
            for (const c of resolved_cases) {
                result.push(cases[c].body);
            }
            result.push(cases[case_name].body);
            result.push(`
        
            function main() {
                return ${case_name}_case_fn();
            }

        `);
            return result.join('')
        };

        for (let [case_name, case_config] of Object.entries(cases_config)) {

            // config sanitization
            if (a$1.type(case_config)() == 'array') {
                case_config = {...case_config};
            }
            const parts = a$1.sane(case_config, `cases.${case_name}`, 'object')();

            const body = [];
            const case_dependencies = [];
            const outline_dependencies = [];
            let first = true;
            for (let [part_name, part] of Object.entries(parts)) {
                if (a$1.type(part)() == 'string') {
                    part = o.operation(part, {
                        outline: Object.keys(outlines),
                        case: Object.keys(cases)
                    }, ['case', 'outline']);
                }
                const part_qname = `cases.${case_name}.${part_name}`;
                const part_var = `${case_name}__part_${part_name}`;
                a$1.unexpected(part, part_qname, ['type', 'name', 'extrude', 'shift', 'rotate', 'operation']);
                const type = a$1.in(part.type || 'outline', `${part_qname}.type`, ['outline', 'case']);
                const name = a$1.sane(part.name, `${part_qname}.name`, 'string')();
                const shift = a$1.numarr(part.shift || [0, 0, 0], `${part_qname}.shift`, 3)(units);
                const rotate = a$1.numarr(part.rotate || [0, 0, 0], `${part_qname}.rotate`, 3)(units);
                const operation = a$1.in(part.operation || 'add', `${part_qname}.operation`, ['add', 'subtract', 'intersect']);

                let base;
                if (type == 'outline') {
                    const extrude = a$1.sane(part.extrude || 1, `${part_qname}.extrude`, 'number')(units);
                    const outline = outlines[name];
                    a$1.assert(outline, `Field "${part_qname}.name" does not name a valid outline!`);
                    if (!scripts[name]) {
                        scripts[name] = m$1.exporter.toJscadScript(outline, {
                            functionName: `${name}_outline_fn`,
                            extrude: extrude,
                            indent: 4
                        });
                    }
                    outline_dependencies.push(name);
                    base = `${name}_outline_fn()`;
                } else {
                    a$1.assert(part.extrude === undefined, `Field "${part_qname}.extrude" should not be used when type=case!`);
                    a$1.in(name, `${part_qname}.name`, Object.keys(cases));
                    case_dependencies.push(name);
                    base = `${name}_case_fn()`;
                }

                let op = 'union';
                if (operation == 'subtract') op = 'subtract';
                else if (operation == 'intersect') op = 'intersect';

                let op_statement = `let result = ${part_var};`;
                if (!first) {
                    op_statement = `result = result.${op}(${part_var});`;
                }
                first = false;

                body.push(`

                // creating part ${part_name} of case ${case_name}
                let ${part_var} = ${base};

                // make sure that rotations are relative
                let ${part_var}_bounds = ${part_var}.getBounds();
                let ${part_var}_x = ${part_var}_bounds[0].x + (${part_var}_bounds[1].x - ${part_var}_bounds[0].x) / 2
                let ${part_var}_y = ${part_var}_bounds[0].y + (${part_var}_bounds[1].y - ${part_var}_bounds[0].y) / 2
                ${part_var} = translate([-${part_var}_x, -${part_var}_y, 0], ${part_var});
                ${part_var} = rotate(${JSON.stringify(rotate)}, ${part_var});
                ${part_var} = translate([${part_var}_x, ${part_var}_y, 0], ${part_var});

                ${part_var} = translate(${JSON.stringify(shift)}, ${part_var});
                ${op_statement}
                
            `);
            }

            cases[case_name] = {
                body: `

                function ${case_name}_case_fn() {
                    ${body.join('')}
                    return result;
                }
            
            `,
                case_dependencies,
                outline_dependencies
            };

            results[case_name] = resolve(case_name);
        }

        return results
    };

    var pcbs = {};

    var alps = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
            class: 'S'
        },
        body: p => `

    (module ALPS (layer F.Cu) (tedit 5CF31DEF)

        ${p.at /* parametric position */}
        
        ${'' /* footprint reference */}
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
        
        ${''/* corner marks */}
        (fp_line (start -7 -6) (end -7 -7) (layer Dwgs.User) (width 0.15))
        (fp_line (start -7 7) (end -6 7) (layer Dwgs.User) (width 0.15))
        (fp_line (start -6 -7) (end -7 -7) (layer Dwgs.User) (width 0.15))
        (fp_line (start -7 7) (end -7 6) (layer Dwgs.User) (width 0.15))
        (fp_line (start 7 6) (end 7 7) (layer Dwgs.User) (width 0.15))
        (fp_line (start 7 -7) (end 6 -7) (layer Dwgs.User) (width 0.15))
        (fp_line (start 6 7) (end 7 7) (layer Dwgs.User) (width 0.15))
        (fp_line (start 7 -7) (end 7 -6) (layer Dwgs.User) (width 0.15))

        ${''/* pins */}
        (pad 1 thru_hole circle (at 2.5 -4.5) (size 2.25 2.25) (drill 1.47) (layers *.Cu *.Mask) ${p.net.from.str})
        (pad 2 thru_hole circle (at -2.5 -4) (size 2.25 2.25) (drill 1.47) (layers *.Cu *.Mask) ${p.net.to.str})
    )

    `
    };

    var button = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
            class: 'B', // for Button
            side: 'F'
        },
        body: p => `
    
    (module E73:SW_TACT_ALPS_SKQGABE010 (layer F.Cu) (tstamp 5BF2CC94)

        (descr "Low-profile SMD Tactile Switch, https://www.e-switch.com/product-catalog/tact/product-lines/tl3342-series-low-profile-smt-tact-switch")
        (tags "SPST Tactile Switch")

        ${p.at /* parametric position */}
        ${'' /* footprint reference */}
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
        
        ${'' /* outline */}
        (fp_line (start 2.75 1.25) (end 1.25 2.75) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start 2.75 -1.25) (end 1.25 -2.75) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start 2.75 -1.25) (end 2.75 1.25) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -1.25 2.75) (end 1.25 2.75) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -1.25 -2.75) (end 1.25 -2.75) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -2.75 1.25) (end -1.25 2.75) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -2.75 -1.25) (end -1.25 -2.75) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -2.75 -1.25) (end -2.75 1.25) (layer ${p.param.side}.SilkS) (width 0.15))
        
        ${'' /* pins */}
        (pad 1 smd rect (at -3.1 -1.85 ${p.rot}) (size 1.8 1.1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.from.str})
        (pad 1 smd rect (at 3.1 -1.85 ${p.rot}) (size 1.8 1.1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.from.str})
        (pad 2 smd rect (at -3.1 1.85 ${p.rot}) (size 1.8 1.1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.to.str})
        (pad 2 smd rect (at 3.1 1.85 ${p.rot}) (size 1.8 1.1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.to.str})
    )
    
    `
    };

    // Kailh Choc PG1350
    // Nets
    //    from: corresponds to pin 1
    //    to: corresponds to pin 2
    // Params
    //    hotswap: default is false
    //      if true, will include holes and pads for Kailh choc hotswap sockets
    //    reverse: default is false
    //      if true, will flip the footprint such that the pcb can be reversible
    //    keycaps: default is false
    //      if true, will add choc sized keycap box around the footprint
    // 
    // note: hotswap and reverse can be used simultaneously

    var choc = {
      nets: {
        from: undefined,
        to: undefined
      },
      params: {
        class: 'S',
        hotswap: false,
        reverse: false,
        keycaps: false,
        model: './3d/SW_Kailh_Choc_V1.stp',
        hotswap_model: './3d/PG1350-socket.STEP',
        keycap_model: './3d/MBK_Keycap_-_1u.step',
      },
      body: p => {
        const standard = `
      (module PG1350 (layer F.Cu) (tedit 5DD50112)
      ${p.at /* parametric position */}

      ${'' /* footprint reference */}
      (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
      (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))

      ${''/* corner marks */}
      (fp_line (start -7 -6) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -6 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -6 -7) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -7 6) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 6) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 6 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 6 7) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 7 -6) (layer Dwgs.User) (width 0.15))      
      
      ${''/* middle shaft */}
      (pad "" np_thru_hole circle (at 0 0) (size 3.429 3.429) (drill 3.429) (layers *.Cu *.Mask))
        
      ${''/* stabilizers */}
      (pad "" np_thru_hole circle (at 5.5 0) (size 1.7018 1.7018) (drill 1.7018) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -5.5 0) (size 1.7018 1.7018) (drill 1.7018) (layers *.Cu *.Mask))
      `;
        const keycap = `
      ${'' /* keycap marks */}
      (fp_line (start -9 -8.5) (end 9 -8.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start 9 -8.5) (end 9 8.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start 9 8.5) (end -9 8.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start -9 8.5) (end -9 -8.5) (layer Dwgs.User) (width 0.15))
      `;
        function pins(def_neg, def_pos, def_side) {
          if(p.param.hotswap) {
            return `
          ${'' /* holes */}
          (pad "" np_thru_hole circle (at ${def_pos}5 -3.75) (size 3 3) (drill 3) (layers *.Cu *.Mask))
          (pad "" np_thru_hole circle (at 0 -5.95) (size 3 3) (drill 3) (layers *.Cu *.Mask))
      
          ${'' /* net pads */}
          (pad 1 smd rect (at ${def_neg}3.275 -5.95 ${p.rot}) (size 2.6 2.6) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask)  ${p.net.from.str})
          (pad 2 smd rect (at ${def_pos}8.275 -3.75 ${p.rot}) (size 2.6 2.6) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask)  ${p.net.to.str})
        `
          } else {
              return `
            ${''/* pins */}
            (pad 1 thru_hole circle (at ${def_pos}5 -3.8) (size 2.032 2.032) (drill 1.27) (layers *.Cu *.Mask) ${p.net.from.str})
            (pad 2 thru_hole circle (at ${def_pos}0 -5.9) (size 2.032 2.032) (drill 1.27) (layers *.Cu *.Mask) ${p.net.to.str})
          `
          }
        }

          return `
        ${standard}
        ${p.param.keycaps ? keycap : ''}
        ${pins('-', '', 'B')}
        ${ p.param.reverse ? pins('', '-', 'F') : '' }
        ${ p.param.hotswap ? `
          (model ${p.param.hotswap_model}
              (at (xyz -0.21 0.15 -0.07))
              (scale (xyz 1 1 1))
              (rotate (xyz -90 0 180))
          )
          ` : ''
        }
        
        ${ p.param.keycaps ? `
          (model ${p.param.keycap_model}
              (at (xyz 0 0 0.25))
              (scale (xyz 1 1 1))
              (rotate (xyz 0 0 0))
          )
          ` : ''
        }
        (model ${p.param.model}
              (at (xyz 0 0 0))
              (scale (xyz 1 1 1))
              (rotate (xyz 0 0 0))
        )
        
        
        )
        `
        }
    };

    // Kailh Choc PG1232
    // Nets
    //    from: corresponds to pin 1
    //    to: corresponds to pin 2
    // Params
    //    reverse: default is false
    //      if true, will flip the footprint such that the pcb can be reversible 
    //    keycaps: default is false
    //      if true, will add choc sized keycap box around the footprint

    var chocmini = {
        nets: {
          from: undefined,
          to: undefined
        },
        params: {
          class: 'S',
    		  side: 'F',
    		  reverse: false,
          keycaps: false
        },
        body: p => {
    	    const standard = `
        (module lib:Kailh_PG1232 (layer F.Cu) (tedit 5E1ADAC2)
        ${p.at /* parametric position */} 

        ${'' /* footprint reference */}        
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value Kailh_PG1232 (at 0 -7.3) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))

        ${'' /* corner marks */}
        (fp_line (start -7.25 -6.75) (end -6.25 -6.75) (layer Dwgs.User) (width 0.15))
        (fp_line (start -7.25 -6.75) (end -7.25 -5.75) (layer Dwgs.User) (width 0.15))

        (fp_line (start -7.25 6.75) (end -6.25 6.75) (layer Dwgs.User) (width 0.15))
        (fp_line (start -7.25 6.75) (end -7.25 5.75) (layer Dwgs.User) (width 0.15))

        (fp_line (start 7.25 -6.75) (end 6.25 -6.75) (layer Dwgs.User) (width 0.15))
        (fp_line (start 7.25 -6.75) (end 7.25 -5.75) (layer Dwgs.User) (width 0.15))

        (fp_line (start 7.25 6.75) (end 6.25 6.75) (layer Dwgs.User) (width 0.15))
        (fp_line (start 7.25 6.75) (end 7.25 5.75) (layer Dwgs.User) (width 0.15))


        (fp_line (start 2.8 -5.35) (end -2.8 -5.35) (layer Dwgs.User) (width 0.15))
        (fp_line (start -2.8 -3.2) (end 2.8 -3.2) (layer Dwgs.User) (width 0.15))
        (fp_line (start 2.8 -3.2) (end 2.8 -5.35) (layer Dwgs.User) (width 0.15))
        (fp_line (start -2.8 -3.2) (end -2.8 -5.35) (layer Dwgs.User) (width 0.15))
        
        ${''/* middle shaft */}        	 
        (fp_line (start 2.25 2.6) (end 5.8 2.6) (layer Edge.Cuts) (width 0.12))
        (fp_line (start -2.25 2.6) (end -5.8 2.6) (layer Edge.Cuts) (width 0.12))
        (fp_line (start 2.25 3.6) (end 2.25 2.6) (layer Edge.Cuts) (width 0.12))
        (fp_line (start -2.25 3.6) (end 2.25 3.6) (layer Edge.Cuts) (width 0.12))
        (fp_line (start -2.25 2.6) (end -2.25 3.6) (layer Edge.Cuts) (width 0.12))
        (fp_line (start -5.8 2.6) (end -5.8 -2.95) (layer Edge.Cuts) (width 0.12))
        (fp_line (start 5.8 -2.95) (end 5.8 2.6) (layer Edge.Cuts) (width 0.12))
        (fp_line (start -5.8 -2.95) (end 5.8 -2.95) (layer Edge.Cuts) (width 0.12))
        
        ${''/* stabilizers */}    
        (pad 3 thru_hole circle (at 5.3 -4.75) (size 1.6 1.6) (drill 1.1) (layers *.Cu *.Mask) (clearance 0.2))
        (pad 4 thru_hole circle (at -5.3 -4.75) (size 1.6 1.6) (drill 1.1) (layers *.Cu *.Mask) (clearance 0.2))
      `;
          const keycap = `
        ${'' /* keycap marks */}
        (fp_line (start -9 -8.5) (end 9 -8.5) (layer Dwgs.User) (width 0.15))
        (fp_line (start 9 -8.5) (end 9 8.5) (layer Dwgs.User) (width 0.15))
        (fp_line (start 9 8.5) (end -9 8.5) (layer Dwgs.User) (width 0.15))
        (fp_line (start -9 8.5) (end -9 -8.5) (layer Dwgs.User) (width 0.15))
        `;
          function pins(def_neg, def_pos) {
            return `
        ${''/* pins */}
        (pad 1 thru_hole circle (at ${def_neg}4.58 5.1) (size 1.6 1.6) (drill 1.1) (layers *.Cu *.Mask) ${p.net.from.str} (clearance 0.2))
        (pad 2 thru_hole circle (at ${def_pos}2 5.4) (size 1.6 1.6) (drill 1.1) (layers *.Cu *.Mask) ${p.net.to.str} (clearance 0.2))
			  `
          }
          if(p.param.reverse){
            return `
          ${standard}
          ${p.param.keycaps ? keycap : ''}
          ${pins('-', '')}
          ${pins('', '-')})

          `
          } else {
            return `
          ${standard}
          ${p.param.keycaps ? keycap : ''}
          ${pins('-', '')})
          `
          }
        }
      };

    var diode = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
            class: 'D',
            through_hole: true,
            via_in_pad: false
        },
        body: p => `
  
    (module ComboDiode (layer F.Cu) (tedit 5B24D78E)


        ${p.at /* parametric position */}

        ${'' /* footprint reference */}
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
        
        ${''/* diode symbols */}
        (fp_line (start 0.25 0) (end 0.75 0) (layer F.SilkS) (width 0.1))
        (fp_line (start 0.25 0.4) (end -0.35 0) (layer F.SilkS) (width 0.1))
        (fp_line (start 0.25 -0.4) (end 0.25 0.4) (layer F.SilkS) (width 0.1))
        (fp_line (start -0.35 0) (end 0.25 -0.4) (layer F.SilkS) (width 0.1))
        (fp_line (start -0.35 0) (end -0.35 0.55) (layer F.SilkS) (width 0.1))
        (fp_line (start -0.35 0) (end -0.35 -0.55) (layer F.SilkS) (width 0.1))
        (fp_line (start -0.75 0) (end -0.35 0) (layer F.SilkS) (width 0.1))
        (fp_line (start 0.25 0) (end 0.75 0) (layer B.SilkS) (width 0.1))
        (fp_line (start 0.25 0.4) (end -0.35 0) (layer B.SilkS) (width 0.1))
        (fp_line (start 0.25 -0.4) (end 0.25 0.4) (layer B.SilkS) (width 0.1))
        (fp_line (start -0.35 0) (end 0.25 -0.4) (layer B.SilkS) (width 0.1))
        (fp_line (start -0.35 0) (end -0.35 0.55) (layer B.SilkS) (width 0.1))
        (fp_line (start -0.35 0) (end -0.35 -0.55) (layer B.SilkS) (width 0.1))
        (fp_line (start -0.75 0) (end -0.35 0) (layer B.SilkS) (width 0.1))

        ${ p.param.via_in_pad ?
            `
             ${''/* Vias in SMD pads */}   
             (pad 1 thru_hole rect (at -1.65 0 ${ p.rot }) (size 0.9 1.2) (drill 0.3) (layers *.Cu *.Mask) (zone_connect 2) ${ p.net.to.str })
             (pad 2 thru_hole rect (at 1.65 0 ${ p.rot }) (size 0.9 1.2) (drill 0.3) (layers *.Cu *.Mask) (zone_connect 2) ${ p.net.from.str })
            `
        :
            `
             ${ ''/* SMD pads on both sides */ }
             (pad 1 smd rect (at -1.65 0 ${ p.rot }) (size 0.9 1.2) (layers F.Cu F.Paste F.Mask) ${ p.net.to.str })
             (pad 2 smd rect (at 1.65 0 ${ p.rot }) (size 0.9 1.2) (layers B.Cu B.Paste B.Mask) ${ p.net.from.str })
             (pad 1 smd rect (at -1.65 0 ${ p.rot }) (size 0.9 1.2) (layers B.Cu B.Paste B.Mask) ${ p.net.to.str })
             (pad 2 smd rect (at 1.65 0 ${ p.rot }) (size 0.9 1.2) (layers F.Cu F.Paste F.Mask) ${ p.net.from.str })
            `
        }
        
        ${ p.param.through_hole === false ?
            ''
        :
            `
             ${''/* THT terminals */}
             (pad 1 thru_hole circle (at 3.81 0 ${ p.rot }) (size 1.905 1.905) (drill 0.9906) (layers *.Cu *.Mask) ${ p.net.from.str })
             (pad 2 thru_hole rect (at -3.81 0 ${ p.rot }) (size 1.778 1.778) (drill 0.9906) (layers *.Cu *.Mask) ${ p.net.to.str })
            `
        }

    )
    `
    };

    // Holyiot 18010 nRF52840 module

    var holyiot = {
        nets: {
            DMIN: 'DMIN',
            DPLUS: 'DPLUS',
            GND: 'GND',
            P002: 'P002',
            P003: 'P003',
            P004: 'P004',
            P005: 'P005',
            P006: 'P006',
            P007: 'P007',
            P008: 'P008',
            P009: 'P009',
            P010: 'P010',
            P011: 'P011',
            P012: 'P012',
            P013: 'P013',
            P014: 'P014',
            P015: 'P015',
            P016: 'P016',
            P017: 'P017',
            P018: 'P018',
            P019: 'P019',
            P020: 'P020',
            P021: 'P021',
            P022: 'P022',
            P023: 'P023',
            P024: 'P024',
            P025: 'P025',
            P026: 'P026',
            P027: 'P027',
            P028: 'P028',
            P029: 'P029',
            P030: 'P030',
            P031: 'P031',
            P100: 'P100',
            P101: 'P101',
            P102: 'P102',
            P103: 'P103',
            P104: 'P104',
            P105: 'P105',
            P106: 'P106',
            P107: 'P107',
            P108: 'P108',
            P109: 'P109',
            P110: 'P110',
            P111: 'P111',
            P112: 'P112',
            P113: 'P113',
            P114: 'P114',
            P115: 'P115',
            SWDCLK: 'SWDCLK',
            SWDIO: 'SWDIO',
            VBUS: 'VBUS',
            VDD: 'VDD',
        },
        params: {
            class: 'MCU',
            underside_pads: true,
            // By placing a model in the path specified below KiCad will show it in the 3D viewer
            model: './3d/holyiot_18010_nRF52840.step'
        },
        body: p => `
        ${ '' /* footprint reference */ }
        (module nRF52840_holyiot_18010 (layer F.Cu) (tedit 600753CA)
    
        ${ p.at /* parametric position */ }

        (fp_text value nRF52840_holyiot_18010 (at 0 2.8) (layer F.Fab)
          (effects (font (size 1 1) (thickness 0.15)))
        )

        (pad 1 smd rect (at -6.75 -5.7 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask)  ${ p.net.GND.str })
        (pad 2 smd rect (at -6.75 -4.6 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask)  ${ p.net.P110.str })
        (pad 3 smd rect (at -6.75 -3.5 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask)  ${ p.net.P111.str })
        (pad 4 smd rect (at -6.75 -2.4 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P113.str })
        (pad 5 smd rect (at -6.75 -1.3 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P115.str })
        (pad 6 smd rect (at -6.75 -0.2 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P003.str })
        (pad 7 smd rect (at -6.75 0.9 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P002.str })
        (pad 8 smd rect (at -6.75 2 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask)  ${ p.net.P028.str })
        (pad 9 smd rect (at -6.75 3.1 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P029.str })
        (pad 10 smd rect (at -6.75 4.2 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P030.str })
        (pad 11 smd rect (at -6.75 5.3 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P031.str })
        (pad 12 smd rect (at -6.75 6.4 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P004.str })
        (pad 13 smd rect (at -6.75 7.5 ${ p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P005.str })
        (pad 14 smd rect (at -5.5 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.VDD.str })
        (pad 15 smd rect (at -4.4 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P007.str })
        (pad 16 smd rect (at -3.3 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P109.str })
        (pad 17 smd rect (at -2.2 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P012.str })
        (pad 18 smd rect (at -1.1 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P023.str })
        (pad 19 smd rect (at 0 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P021.str })
        (pad 20 smd rect (at 1.1 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P019.str })
        (pad 21 smd rect (at 2.2 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P018.str })
        (pad 22 smd rect (at 3.3 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.VBUS.str })
        (pad 23 smd rect (at 4.4 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.DMIN.str })
        (pad 24 smd rect (at 5.5 9 ${ 90 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.DPLUS.str })
        (pad 25 smd rect (at 6.75 7.5 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.GND.str })
        (pad 26 smd rect (at 6.75 6.4 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P022.str })
        (pad 27 smd rect (at 6.75 5.3 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P100.str })
        (pad 28 smd rect (at 6.75 4.2 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P103.str })
        (pad 29 smd rect (at 6.75 3.1 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P101.str })
        (pad 30 smd rect (at 6.75 2 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P102.str })
        (pad 31 smd rect (at 6.75 0.9 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.SWDCLK.str })
        (pad 32 smd rect (at 6.75 -0.2 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.SWDIO.str })
        (pad 33 smd rect (at 6.75 -1.3 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P104.str })
        (pad 34 smd rect (at 6.75 -2.4 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P106.str })
        (pad 35 smd rect (at 6.75 -3.5 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P009.str })
        (pad 36 smd rect (at 6.75 -4.6 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.P010.str })
        (pad 37 smd rect (at 6.75 -5.7 ${ 180 + p.rot }) (size 1.524 0.7) (layers F.Cu F.Paste F.Mask) ${ p.net.GND.str })
        
        ${ p.param.underside_pads ? `
            (pad 38 thru_hole rect (at -4.25 -3.5 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P114.str })
            (pad 39 thru_hole rect (at -4.25 -2.4 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P112.str })
            (pad 40 thru_hole rect (at -4.25 -1.3 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P025.str })
            (pad 41 thru_hole rect (at -4.25 -0.2 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P011.str })
            (pad 42 thru_hole rect (at -4.25 0.9 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P108.str })
            (pad 43 thru_hole rect (at -4.25 2 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P027.str })
            (pad 44 thru_hole rect (at -4.25 3.1 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P008.str })
            (pad 45 thru_hole rect (at -4.25 4.2 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P006.str })
            (pad 46 thru_hole rect (at -4.25 5.3 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P026.str })
            (pad 47 thru_hole rect (at 4.25 -3.5 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P107.str })
            (pad 48 thru_hole rect (at 4.25 -2.4 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P105.str })
            (pad 49 thru_hole rect (at 4.25 -1.3 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P024.str })
            (pad 50 thru_hole rect (at 4.25 -0.2 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P020.str })
            (pad 51 thru_hole rect (at 4.25 0.9 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P017.str })
            (pad 52 thru_hole rect (at 4.25 2 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P015.str })
            (pad 53 thru_hole rect (at 4.25 3.1 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P014.str })
            (pad 54 thru_hole rect (at 4.25 4.2 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P013.str })
            (pad 55 thru_hole rect (at 4.25 5.3 ${ 180 + p.rot }) (size 1.524 0.7) (drill 0.4) (layers *.Cu *.Mask) ${ p.net.P016.str })
        ` :
        ``
        }

        (fp_line (start -6.75 -9) (end 6.75 -9) (layer F.CrtYd) (width 0.12))
        (fp_line (start 6.75 -9) (end 6.75 9) (layer F.CrtYd) (width 0.12))
        (fp_line (start 6.75 9) (end -6.75 9) (layer F.CrtYd) (width 0.12))
        (fp_line (start -6.75 9) (end -6.75 -9) (layer F.CrtYd) (width 0.12))
        (fp_line (start -7.25 8.5) (end -7.25 9.5) (layer F.SilkS) (width 0.12))
        (fp_line (start 7.25 8.5) (end 7.25 9.5) (layer F.SilkS) (width 0.12))
        (fp_line (start 6.25 9.5) (end 7.25 9.5) (layer F.SilkS) (width 0.12))
        (fp_line (start -6.25 9.5) (end -7.25 9.5) (layer F.SilkS) (width 0.12))
        (fp_line (start -9.5 -11.2) (end 9.5 -11.2) (layer Dwgs.User) (width 0.12))
        (fp_line (start 9.5 -11.2) (end 9.5 -6.2) (layer Dwgs.User) (width 0.12))
        (fp_line (start 9.5 -6.2) (end -9.5 -6.2) (layer Dwgs.User) (width 0.12))
        (fp_line (start -9.5 -6.2) (end -9.5 -11.2) (layer Dwgs.User) (width 0.12))

        (fp_text user "Antenna keepout" (at 0 -9 ${ p.rot-180 }) (layer Dwgs.User)
          (effects (font (size 1 1) (thickness 0.15)))
        )
        
        (zone
            (name "holyiot-keepout")
            (layers F&B.Cu)
            (hatch edge 0.508)
            (connect_pads (clearance 0))
            (min_thickness 0.254)
            (keepout (tracks not_allowed) (vias not_allowed) (pads not_allowed ) (copperpour not_allowed) (footprints not_allowed))
            (fill (thermal_gap 0.508) (thermal_bridge_width 0.508))
            (polygon
              (pts
                (xy ${p.xy(-9.5, -11.2)})
                (xy ${p.xy(9.5, -11.2)})
                (xy ${p.xy(9.5, -6.2)})
                (xy ${p.xy(-9.5, -6.2)})
              )
            )
        )
        
        (model ${p.param.model}
            (at (xyz 0 0 0))
            (scale (xyz 1 1 1))
            (rotate (xyz -90 0 0))
        )
    )
    `
    };

    var jstph = {
        nets: {
            pos: undefined,
            neg: undefined
        },
        params: {
            class: 'JST',
            side: 'F'
        },
        body: p => `
    
    (module JST_PH_S2B-PH-K_02x2.00mm_Angled (layer F.Cu) (tedit 58D3FE32)

        (descr "JST PH series connector, S2B-PH-K, side entry type, through hole, Datasheet: http://www.jst-mfg.com/product/pdf/eng/ePH.pdf")
        (tags "connector jst ph")

        ${p.at /* parametric position */}

        ${'' /* footprint reference */}
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))

        (fp_line (start -2.25 0.25) (end -2.25 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -2.25 -1.35) (end -2.95 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -2.95 -1.35) (end -2.95 6.25) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -2.95 6.25) (end 2.95 6.25) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start 2.95 6.25) (end 2.95 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start 2.95 -1.35) (end 2.25 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start 2.25 -1.35) (end 2.25 0.25) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start 2.25 0.25) (end -2.25 0.25) (layer ${p.param.side}.SilkS) (width 0.15))

        (fp_line (start -1 1.5) (end -1 2.0) (layer ${p.param.side}.SilkS) (width 0.15))
        (fp_line (start -1.25 1.75) (end -0.75 1.75) (layer ${p.param.side}.SilkS) (width 0.15))

        (pad 1 thru_hole rect (at -1 0 ${p.rot}) (size 1.2 1.7) (drill 0.75) (layers *.Cu *.Mask) ${p.net.pos.str})
        (pad 2 thru_hole oval (at 1 0 ${p.rot}) (size 1.2 1.7) (drill 0.75) (layers *.Cu *.Mask) ${p.net.neg.str})
            
    )
    
    `
    };

    var jumper = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
          class: 'J',
    	  side: 'F'
        },
        body: p => `
        (module lib:Jumper (layer F.Cu) (tedit 5E1ADAC2)
        ${p.at /* parametric position */} 

        ${'' /* footprint reference */}        
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value Jumper (at 0 -7.3) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))

        ${'' /* pins */}
        (pad 1 smd rect (at -0.50038 0 ${p.rot}) (size 0.635 1.143) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask)
        (clearance 0.1905) ${p.net.from.str})
        (pad 2 smd rect (at 0.50038 0 ${p.rot}) (size 0.635 1.143) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask)
        (clearance 0.1905) ${p.net.to.str}))
    `
    };

    // MountingHole_2.2mm_M2_Pad_Via
    // TODO add more sizes as param?
    var mountinghole = {
        nets: {
            net: undefined
        },
        params: {
            class: 'HOLE',
        },
        body: p => `
    (module "MountingHole_2.2mm_M2_Pad_Via" (version 20210722) (generator pcbnew) (layer "F.Cu")
      (tedit 56DDB9C7)
      ${p.at /* parametric position */} 
    
      (fp_text reference "${p.ref}" (at 0 -3.2) (layer "F.SilkS") ${p.ref_hide} 
        (effects (font (size 1 1) (thickness 0.15)))
        (tstamp b68bb25c-687d-44b1-b966-dad4cac66b35)
      )
    
      (fp_circle (center 0 0) (end 2.45 0) (layer "F.CrtYd") (width 0.05) (fill none) (tstamp b2688462-c375-45d3-9095-3425fb17c88f))
      (pad "1" thru_hole circle locked (at 1.166726 1.166726) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp 2a7fc905-328f-4bbb-9222-ca8d15d03a86))
      (pad "1" thru_hole circle locked (at 0 0) (size 4.4 4.4) (drill 2.2) (layers *.Cu *.Mask) (tstamp 47ee1d53-0551-4b6d-bc24-3f3f14c73c36))
      (pad "1" thru_hole circle locked (at 0 1.65) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp 4eef65bc-4add-40d7-8319-14dcdbae0d44))
      (pad "1" thru_hole circle locked (at 1.166726 -1.166726) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp 56155f4d-2ebc-4ad4-8d82-7aa7846deba8))
      (pad "1" thru_hole circle locked (at -1.65 0) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp 787d6162-1d3c-4def-859e-6532ce27c1ef))
      (pad "1" thru_hole circle locked (at -1.166726 -1.166726) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp 8d699d12-7099-4814-bbe6-11bc74c6e8b2))
      (pad "1" thru_hole circle locked (at -1.166726 1.166726) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp 95ab0420-a56b-46ee-98ad-5072a1a93a6f))
      (pad "1" thru_hole circle locked (at 1.65 0) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp cde0acf2-b3b4-46de-9f6e-3ab519744000))
      (pad "1" thru_hole circle locked (at 0 -1.65) (size 0.7 0.7) (drill 0.4) (layers *.Cu *.Mask) (tstamp ff0de415-ae11-46fb-b780-c24aee621212))
    )`
    };

    // Any MX switch
    // Nets
    //    from: corresponds to pin 1
    //    to: corresponds to pin 2
    // Params
    //    hotswap: default is false
    //      if true, will include holes and pads for Kailh MX hotswap sockets
    //    reverse: default is false
    //      if true, will flip the footprint such that the pcb can be reversible 
    //    keycaps: default is false
    //      if true, will add choc sized keycap box around the footprint
    //
    // note: hotswap and reverse can be used simultaneously

    var mx = {
      nets: {
        from: undefined,
        to: undefined
      },
      params: {
          class: 'S',
          hotswap: false,
          reverse: false,
          keycaps: false,
          // By placing a model in the path specified below KiCad will show it in the 3D viewer
          model: './3d/SW_Cherry_MX_PCB.stp'
      },
      body: p => {
        const standard = `
      (module MX (layer F.Cu) (tedit 5DD4F656)
      ${p.at /* parametric position */}

      ${'' /* footprint reference */}
      (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
      (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))

      ${''/* corner marks */}
      (fp_line (start -7 -6) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -6 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -6 -7) (end -7 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start -7 7) (end -7 6) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 6) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 6 -7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 6 7) (end 7 7) (layer Dwgs.User) (width 0.15))
      (fp_line (start 7 -7) (end 7 -6) (layer Dwgs.User) (width 0.15))
    
      ${''/* middle shaft */}
      (pad "" np_thru_hole circle (at 0 0) (size 3.9878 3.9878) (drill 3.9878) (layers *.Cu *.Mask))

      ${''/* stabilizers */}
      (pad "" np_thru_hole circle (at 5.08 0) (size 1.7018 1.7018) (drill 1.7018) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -5.08 0) (size 1.7018 1.7018) (drill 1.7018) (layers *.Cu *.Mask))
      `;
        const keycap = `
      ${'' /* keycap marks */}
      (fp_line (start -9.5 -9.5) (end 9.5 -9.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start 9.5 -9.5) (end 9.5 9.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start 9.5 9.5) (end -9.5 9.5) (layer Dwgs.User) (width 0.15))
      (fp_line (start -9.5 9.5) (end -9.5 -9.5) (layer Dwgs.User) (width 0.15))
      `;
        function pins(def_neg, def_pos, def_side) {
          if(p.param.hotswap) {
            return `
        ${'' /* holes */}
        (pad "" np_thru_hole circle (at ${def_pos}2.54 -5.08) (size 3 3) (drill 3) (layers *.Cu *.Mask))
        (pad "" np_thru_hole circle (at ${def_neg}3.81 -2.54) (size 3 3) (drill 3) (layers *.Cu *.Mask))
        
        ${'' /* net pads */}
        (pad 1 smd rect (at ${def_neg}7.085 -2.54 ${p.rot+180}) (size 2.55 2.5) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask) ${p.net.from.str})
        (pad 2 smd rect (at ${def_pos}5.842 -5.08 ${p.rot+180}) (size 2.55 2.5) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask) ${p.net.to.str})
        `
          } else {
              return `
            ${''/* pins */}
            (pad 1 thru_hole circle (at ${def_pos}2.54 -5.08) (size 2.286 2.286) (drill 1.4986) (layers *.Cu *.Mask) ${p.net.from.str})
            (pad 2 thru_hole circle (at ${def_neg}3.81 -2.54) (size 2.286 2.286) (drill 1.4986) (layers *.Cu *.Mask) ${p.net.to.str})
          `
          }
        }

          return `
        ${standard}
        ${p.param.keycaps ? keycap : ''}
        ${pins('-', '', 'B')}
        ${p.param.reverse ? pins('', '-', 'F') : ''}
        
         (model ${p.param.model}
            (at (xyz 0 0 0))
            (scale (xyz 1 1 1))
            (rotate (xyz 0 0 0))
        )
        )
        `
      }
    };

    var oled = {
        nets: {
          SDA: undefined,
          SCL: undefined,
          VCC: 'VCC',
          GND: 'GND'
        },
        params: {
          class: 'OLED',
    	    side: 'F'
        },
        body: p => `
        (module lib:OLED_headers (layer F.Cu) (tedit 5E1ADAC2)
        ${p.at /* parametric position */} 

        ${'' /* footprint reference */}        
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value OLED (at 0 -7.3) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))

        ${'' /* pins */}
        (pad 4 thru_hole oval (at 1.6 2.18 ${p.rot+270}) (size 1.7 1.7) (drill 1) (layers *.Cu *.Mask)
        ${p.net.SDA.str})
        (pad 3 thru_hole oval (at 1.6 4.72 ${p.rot+270}) (size 1.7 1.7) (drill 1) (layers *.Cu *.Mask)
        ${p.net.SCL.str})
        (pad 2 thru_hole oval (at 1.6 7.26 ${p.rot+270}) (size 1.7 1.7) (drill 1) (layers *.Cu *.Mask)
        ${p.net.VCC.str})
        (pad 1 thru_hole rect (at 1.6 9.8 ${p.rot+270}) (size 1.7 1.7) (drill 1) (layers *.Cu *.Mask)
        ${p.net.GND.str})
        )
        `
    };

    var omron = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
            class: 'S'
        },
        body: p => `
    
    (module OMRON_B3F-4055 (layer F.Cu) (tstamp 5BF2CC94)

        ${p.at /* parametric position */}
        ${'' /* footprint reference */}
        (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
        (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
        
        ${'' /* stabilizers */}
        (pad "" np_thru_hole circle (at 0 -4.5) (size 1.8 1.8) (drill 1.8) (layers *.Cu *.Mask))
        (pad "" np_thru_hole circle (at 0 4.5) (size 1.8 1.8) (drill 1.8) (layers *.Cu *.Mask))

        ${'' /* switch marks */}
        (fp_line (start -6 -6) (end 6 -6) (layer Dwgs.User) (width 0.15))
        (fp_line (start 6 -6) (end 6 6) (layer Dwgs.User) (width 0.15))
        (fp_line (start 6 6) (end -6 6) (layer Dwgs.User) (width 0.15))
        (fp_line (start -6 6) (end -6 -6) (layer Dwgs.User) (width 0.15))

        ${'' /* pins */}
        (pad 1 np_thru_hole circle (at 6.25 -2.5) (size 1.2 1.2) (drill 1.2) (layers *.Cu *.Mask) ${p.net.from.str})
        (pad 2 np_thru_hole circle (at -6.25 -2.5) (size 1.2 1.2) (drill 1.2) (layers *.Cu *.Mask) ${p.net.from.str})
        (pad 3 np_thru_hole circle (at 6.25 2.5) (size 1.2 1.2) (drill 1.2) (layers *.Cu *.Mask) ${p.net.to.str})
        (pad 4 np_thru_hole circle (at -6.25 2.5 ) (size 1.2 1.2) (drill 1.2) (layers *.Cu *.Mask) ${p.net.to.str})
    )
    
    `
    };

    var pad = {
        nets: {
            net: undefined
        },
        params: {
            class: 'PAD',
            width: 1,
            height: 1,
            front: true,
            back: true,
            text: '',
            align: 'left',
            mirrored: '=mirrored'
        },
        body: p => {

            const layout = (toggle, side) => {
                if (!toggle) return ''
                let x = 0, y = 0;
                const mirror = side == 'B' ? '(justify mirror)' : '';
                const plus = (p.param.text.length + 1) * 0.5;
                let align = p.param.align;
                if (p.param.mirrored === true) {
                    if (align == 'left') align = 'right';
                    else if (align == 'right') align = 'left';
                }
                if (align == 'left') x -= p.param.width / 2 + plus;
                if (align == 'right') x += p.param.width / 2 + plus;
                if (align == 'up') y += p.param.height / 2 + plus;
                if (align == 'down') y -= p.param.height / 2 + plus;
                const text = `(fp_text user ${p.param.text} (at ${x} ${y} ${p.rot}) (layer ${side}.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15)) ${mirror}))`;
                return `(pad 1 smd rect (at 0 0 ${p.rot}) (size ${p.param.width} ${p.param.height}) (layers ${side}.Cu ${side}.Paste ${side}.Mask) ${p.net.net.str})\n${text}`
            };

            return `
    
        (module SMDPad (layer F.Cu) (tedit 5B24D78E)

            ${p.at /* parametric position */}

            ${'' /* footprint reference */}
            (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
            (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
            
            ${''/* SMD pads */}
            ${layout(p.param.front, 'F')}
            ${layout(p.param.back, 'B')}
            
        )
    
        `
        }
    };

    // Arduino ProMicro atmega32u4au
    // Params
    //  orientation: default is down
    //    if down, power led will face the pcb
    //    if up, power led will face away from pcb

    var promicro = {
      nets: {
        RAW: 'RAW',
        GND: 'GND',
        RST: 'RST',
        VCC: 'VCC',
        P21: 'P21',
        P20: 'P20',
        P19: 'P19',
        P18: 'P18',
        P15: 'P15',
        P14: 'P14',
        P16: 'P16',
        P10: 'P10',
        P1: 'P1',
        P0: 'P0',
        P2: 'P2',
        P3: 'P3',
        P4: 'P4',
        P5: 'P5',
        P6: 'P6',
        P7: 'P7',
        P8: 'P8',
        P9: 'P9',
      },
      params: {
        class: 'MCU',
        orientation: 'down'
      },
      body: p => {
        const standard = `
      (module ProMicro (layer F.Cu) (tedit 5B307E4C)
      ${p.at /* parametric position */}

      ${'' /* footprint reference */}
      (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
      (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
    
      ${''/* illustration of the (possible) USB port overhang */}
      (fp_line (start -19.304 -3.81) (end -14.224 -3.81) (layer Dwgs.User) (width 0.15))
      (fp_line (start -19.304 3.81) (end -19.304 -3.81) (layer Dwgs.User) (width 0.15))
      (fp_line (start -14.224 3.81) (end -19.304 3.81) (layer Dwgs.User) (width 0.15))
      (fp_line (start -14.224 -3.81) (end -14.224 3.81) (layer Dwgs.User) (width 0.15))
    
      ${''/* component outline */}
      (fp_line (start -17.78 8.89) (end 15.24 8.89) (layer F.SilkS) (width 0.15))
      (fp_line (start 15.24 8.89) (end 15.24 -8.89) (layer F.SilkS) (width 0.15))
      (fp_line (start 15.24 -8.89) (end -17.78 -8.89) (layer F.SilkS) (width 0.15))
      (fp_line (start -17.78 -8.89) (end -17.78 8.89) (layer F.SilkS) (width 0.15))
      `;
        function pins(def_neg, def_pos) {
          return `
        ${''/* extra border around "RAW", in case the rectangular shape is not distinctive enough */}
        (fp_line (start -15.24 ${def_pos}6.35) (end -12.7 ${def_pos}6.35) (layer F.SilkS) (width 0.15))
        (fp_line (start -15.24 ${def_pos}6.35) (end -15.24 ${def_pos}8.89) (layer F.SilkS) (width 0.15))
        (fp_line (start -12.7 ${def_pos}6.35) (end -12.7 ${def_pos}8.89) (layer F.SilkS) (width 0.15))
      
        ${''/* pin names */}
        (fp_text user RAW (at -13.97 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user GND (at -11.43 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user RST (at -8.89 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user VCC (at -6.35 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P21 (at -3.81 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P20 (at -1.27 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P19 (at 1.27 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P18 (at 3.81 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P15 (at 6.35 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P14 (at 8.89 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P16 (at 11.43 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P10 (at 13.97 ${def_pos}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
      
        (fp_text user P01 (at -13.97 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P00 (at -11.43 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user GND (at -8.89 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user GND (at -6.35 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P02 (at -3.81 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P03 (at -1.27 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P04 (at 1.27 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P05 (at 3.81 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P06 (at 6.35 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P07 (at 8.89 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P08 (at 11.43 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
        (fp_text user P09 (at 13.97 ${def_neg}4.8 ${p.rot + 90}) (layer F.SilkS) (effects (font (size 0.8 0.8) (thickness 0.15))))
      
        ${''/* and now the actual pins */}
        (pad 1 thru_hole rect (at -13.97 ${def_pos}7.62 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.RAW.str})
        (pad 2 thru_hole circle (at -11.43 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.GND.str})
        (pad 3 thru_hole circle (at -8.89 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.RST.str})
        (pad 4 thru_hole circle (at -6.35 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.VCC.str})
        (pad 5 thru_hole circle (at -3.81 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P21.str})
        (pad 6 thru_hole circle (at -1.27 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P20.str})
        (pad 7 thru_hole circle (at 1.27 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P19.str})
        (pad 8 thru_hole circle (at 3.81 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P18.str})
        (pad 9 thru_hole circle (at 6.35 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P15.str})
        (pad 10 thru_hole circle (at 8.89 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P14.str})
        (pad 11 thru_hole circle (at 11.43 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P16.str})
        (pad 12 thru_hole circle (at 13.97 ${def_pos}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P10.str})
        
        (pad 13 thru_hole circle (at -13.97 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P1.str})
        (pad 14 thru_hole circle (at -11.43 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P0.str})
        (pad 15 thru_hole circle (at -8.89 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.GND.str})
        (pad 16 thru_hole circle (at -6.35 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.GND.str})
        (pad 17 thru_hole circle (at -3.81 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P2.str})
        (pad 18 thru_hole circle (at -1.27 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P3.str})
        (pad 19 thru_hole circle (at 1.27 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P4.str})
        (pad 20 thru_hole circle (at 3.81 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P5.str})
        (pad 21 thru_hole circle (at 6.35 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P6.str})
        (pad 22 thru_hole circle (at 8.89 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P7.str})
        (pad 23 thru_hole circle (at 11.43 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P8.str})
        (pad 24 thru_hole circle (at 13.97 ${def_neg}7.62 0) (size 1.7526 1.7526) (drill 1.0922) (layers *.Cu *.SilkS *.Mask) ${p.net.P9.str})
      `
        }
        if(p.param.orientation == 'down') {
          return `
        ${standard}
        ${pins('-', '')})
        `
        } else {
          return `
        ${standard}
        ${pins('', '-')})
        `
        }
      }
    };

    var rawkicad = {
        params: {
            class: 'RAW',
            data: ''
        },
        body: p => p.param.data
    };

    var rgb = {
        nets: {
            din: undefined,
            dout: undefined,
            VCC: 'VCC',
            GND: 'GND'
        },
        params: {
            class: 'LED',
            side: 'F'
        },
        body: p => `
    
        (module WS2812B (layer F.Cu) (tedit 53BEE615)

            ${p.at /* parametric position */}

            ${'' /* footprint reference */}
            (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
            (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))

            (fp_line (start -1.75 -1.75) (end -1.75 1.75) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start -1.75 1.75) (end 1.75 1.75) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 1.75 1.75) (end 1.75 -1.75) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 1.75 -1.75) (end -1.75 -1.75) (layer ${p.param.side}.SilkS) (width 0.15))

            (fp_line (start -2.5 -2.5) (end -2.5 2.5) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start -2.5 2.5) (end 2.5 2.5) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 2.5 2.5) (end 2.5 -2.5) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 2.5 -2.5) (end -2.5 -2.5) (layer ${p.param.side}.SilkS) (width 0.15))

            (fp_poly (pts (xy 4 2.2) (xy 4 0.375) (xy 5 1.2875)) (layer ${p.param.side}.SilkS) (width 0.1))

            (pad 1 smd rect (at -2.2 -0.875 ${p.rot}) (size 2.6 1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.VCC.str})
            (pad 2 smd rect (at -2.2 0.875 ${p.rot}) (size 2.6 1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.dout.str})
            (pad 3 smd rect (at 2.2 0.875 ${p.rot}) (size 2.6 1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.GND.str})
            (pad 4 smd rect (at 2.2 -0.875 ${p.rot}) (size 2.6 1) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.din.str})

            (pad 11 smd rect (at -2.5 -1.6 ${p.rot}) (size 2 1.2) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.VCC.str})
            (pad 22 smd rect (at -2.5 1.6 ${p.rot}) (size 2 1.2) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.dout.str})
            (pad 33 smd rect (at 2.5 1.6 ${p.rot}) (size 2 1.2) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.GND.str})
            (pad 44 smd rect (at 2.5 -1.6 ${p.rot}) (size 2 1.2) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.din.str})
            
        )
    
    `
    };

    // EC11 rotary encoder
    //
    // Nets
    //    from: corresponds to switch pin 1 (for button presses)
    //    to: corresponds to switch pin 2 (for button presses)
    //    A: corresponds to pin 1 (for rotary)
    //    B: corresponds to pin 2 (for rotary, should be GND)
    //    C: corresponds to pin 3 (for rotary)

    var rotary = {
        nets: {
            from: undefined,
            to: undefined,
            A: undefined,
            B: undefined,
            C: undefined
        },
        params: {
            class: 'ROT',
            // By placing a model in the path specified below KiCad will show it in the 3D viewer
            model: './3d/ROT_EC11N.step'
        },
        body: p => `
        (module rotary_encoder (layer F.Cu) (tedit 603326DE)

            ${p.at /* parametric position */}
        
            ${'' /* footprint reference */}
            (fp_text reference "${p.ref}" (at 0 0.5) (layer F.SilkS) 
                ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
            (fp_text value "" (at 0 8.89) (layer F.Fab)
                (effects (font (size 1 1) (thickness 0.15))))

            ${''/* component outline */}
            (fp_line (start -0.62 -0.04) (end 0.38 -0.04) (layer F.SilkS) (width 0.12))
            (fp_line (start -0.12 -0.54) (end -0.12 0.46) (layer F.SilkS) (width 0.12))
            (fp_line (start 5.98 3.26) (end 5.98 5.86) (layer F.SilkS) (width 0.12))
            (fp_line (start 5.98 -1.34) (end 5.98 1.26) (layer F.SilkS) (width 0.12))
            (fp_line (start 5.98 -5.94) (end 5.98 -3.34) (layer F.SilkS) (width 0.12))
            (fp_line (start -3.12 -0.04) (end 2.88 -0.04) (layer F.Fab) (width 0.12))
            (fp_line (start -0.12 -3.04) (end -0.12 2.96) (layer F.Fab) (width 0.12))
            (fp_line (start -7.32 -4.14) (end -7.62 -3.84) (layer F.SilkS) (width 0.12))
            (fp_line (start -7.92 -4.14) (end -7.32 -4.14) (layer F.SilkS) (width 0.12))
            (fp_line (start -7.62 -3.84) (end -7.92 -4.14) (layer F.SilkS) (width 0.12))
            (fp_line (start -6.22 -5.84) (end -6.22 5.86) (layer F.SilkS) (width 0.12))
            (fp_line (start -2.12 -5.84) (end -6.22 -5.84) (layer F.SilkS) (width 0.12))
            (fp_line (start -2.12 5.86) (end -6.22 5.86) (layer F.SilkS) (width 0.12))
            (fp_line (start 5.98 5.86) (end 1.88 5.86) (layer F.SilkS) (width 0.12))
            (fp_line (start 1.88 -5.94) (end 5.98 -5.94) (layer F.SilkS) (width 0.12))
            (fp_line (start -6.12 -4.74) (end -5.12 -5.84) (layer F.Fab) (width 0.12))
            (fp_line (start -6.12 5.76) (end -6.12 -4.74) (layer F.Fab) (width 0.12))
            (fp_line (start 5.88 5.76) (end -6.12 5.76) (layer F.Fab) (width 0.12))
            (fp_line (start 5.88 -5.84) (end 5.88 5.76) (layer F.Fab) (width 0.12))
            (fp_line (start -5.12 -5.84) (end 5.88 -5.84) (layer F.Fab) (width 0.12))
            (fp_line (start -8.87 -6.89) (end 7.88 -6.89) (layer F.CrtYd) (width 0.05))
            (fp_line (start -8.87 -6.89) (end -8.87 6.81) (layer F.CrtYd) (width 0.05))
            (fp_line (start 7.88 6.81) (end 7.88 -6.89) (layer F.CrtYd) (width 0.05))
            (fp_line (start 7.88 6.81) (end -8.87 6.81) (layer F.CrtYd) (width 0.05))
            (fp_circle (center -0.12 -0.04) (end 2.88 -0.04) (layer F.SilkS) (width 0.12))
            (fp_circle (center -0.12 -0.04) (end 2.88 -0.04) (layer F.Fab) (width 0.12))

            ${''/* pin names */}
            (pad A thru_hole rect (at -7.62 -2.54 ${p.rot}) (size 2 2) (drill 1) (layers *.Cu *.Mask) ${p.net.A.str})
            (pad C thru_hole circle (at -7.62 -0.04) (size 2 2) (drill 1) (layers *.Cu *.Mask) ${p.net.C.str})
            (pad B thru_hole circle (at -7.62 2.46) (size 2 2) (drill 1) (layers *.Cu *.Mask) ${p.net.B.str})
            (pad 1 thru_hole circle (at 6.88 -2.54) (size 1.5 1.5) (drill 1) (layers *.Cu *.Mask) ${p.net.from.str})
            (pad 2 thru_hole circle (at 6.88 2.46) (size 1.5 1.5) (drill 1) (layers *.Cu *.Mask) ${p.net.to.str})

            ${''/* Legs */}
            (pad "" thru_hole rect (at -0.12 -5.64 ${p.rot}) (size 3.2 2) (drill oval 2.8 1.5) (layers *.Cu *.Mask))
            (pad "" thru_hole rect (at -0.12 5.56 ${p.rot}) (size 3.2 2) (drill oval 2.8 1.5) (layers *.Cu *.Mask))
        
            (model ${p.param.model}
                (at (xyz -0.3 0.1 0))
                (scale (xyz 1 1 1))
                (rotate (xyz 0 0 0))
            )
        )
    `
    };

    // Panasonic EVQWGD001 horizontal rotary encoder
    //
    //   __________________
    //  (f) (t)         | |
    //  | (1)           | |
    //  | (2)           | |
    //  | (3)           | |
    //  | (4)           | |
    //  |_( )___________|_|
    //
    // Nets
    //    from: corresponds to switch pin 1 (for button presses)
    //    to: corresponds to switch pin 2 (for button presses)
    //    A: corresponds to pin 1 (for rotary)
    //    B: corresponds to pin 2 (for rotary, should be GND)
    //    C: corresponds to pin 3 (for rotary)
    //    D: corresponds to pin 4 (for rotary, unused)
    // Params
    //    reverse: default is false
    //      if true, will flip the footprint such that the pcb can be reversible


    var scrollwheel = {
        nets: {
          from: undefined,
          to: undefined,
          A: undefined,
          B: undefined,
          C: undefined,
          D: undefined
        },
        params: {
          class: 'S',
    		  reverse: false
        },
        body: p => {
          const standard = `
        (module RollerEncoder_Panasonic_EVQWGD001 (layer F.Cu) (tedit 6040A10C)
        ${p.at /* parametric position */}   
        (fp_text reference REF** (at 0 0 ${p.rot}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
        (fp_text value RollerEncoder_Panasonic_EVQWGD001 (at -0.1 9 ${p.rot}) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
        
        ${'' /* corner marks */}
        (fp_line (start -8.4 -6.4) (end 8.4 -6.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start 8.4 -6.4) (end 8.4 7.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start 8.4 7.4) (end -8.4 7.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start -8.4 7.4) (end -8.4 -6.4) (layer Dwgs.User) (width 0.12))
      `;
          function pins(def_neg, def_pos) {
            return `
          ${'' /* edge cuts */}
          (fp_line (start ${def_pos}9.8 7.3) (end ${def_pos}9.8 -6.3) (layer Edge.Cuts) (width 0.15))
          (fp_line (start ${def_pos}7.4 -6.3) (end ${def_pos}7.4 7.3) (layer Edge.Cuts) (width 0.15))
          (fp_line (start ${def_pos}9.5 -6.6) (end ${def_pos}7.7 -6.6) (layer Edge.Cuts) (width 0.15))
          (fp_line (start ${def_pos}7.7 7.6) (end ${def_pos}9.5 7.6) (layer Edge.Cuts) (width 0.15))
          (fp_arc (start ${def_pos}7.7 7.3) (end ${def_pos}7.4 7.3) (angle ${def_neg}90) (layer Edge.Cuts) (width 0.15))
          (fp_arc (start ${def_pos}9.5 7.3) (end ${def_pos}9.5 7.6) (angle ${def_neg}90) (layer Edge.Cuts) (width 0.15))
          (fp_arc (start ${def_pos}7.7 -6.3) (end ${def_pos}7.7 -6.6) (angle ${def_neg}90) (layer Edge.Cuts) (width 0.15))
          (fp_arc (start ${def_pos}9.5 -6.3) (end ${def_pos}9.8 -6.3) (angle ${def_neg}90) (layer Edge.Cuts) (width 0.15))

          ${'' /* pins */}
          (pad S1 thru_hole circle (at ${def_neg}6.85 -6.2 ${p.rot}) (size 1.6 1.6) (drill 0.9) (layers *.Cu *.Mask) ${p.net.from.str})
          (pad S2 thru_hole circle (at ${def_neg}5 -6.2 ${p.rot}) (size 1.6 1.6) (drill 0.9) (layers *.Cu *.Mask) ${p.net.to.str})
          (pad A thru_hole circle (at ${def_neg}5.625 -3.81 ${p.rot}) (size 1.6 1.6) (drill 0.9) (layers *.Cu *.Mask) ${p.net.A.str})
          (pad B thru_hole circle (at ${def_neg}5.625 -1.27 ${p.rot}) (size 1.6 1.6) (drill 0.9) (layers *.Cu *.Mask) ${p.net.B.str})
          (pad C thru_hole circle (at ${def_neg}5.625 1.27 ${p.rot}) (size 1.6 1.6) (drill 0.9) (layers *.Cu *.Mask) ${p.net.C.str})
          (pad D thru_hole circle (at ${def_neg}5.625 3.81 ${p.rot}) (size 1.6 1.6) (drill 0.9) (layers *.Cu *.Mask) ${p.net.D.str})

          ${'' /* stabilizer */}
          (pad "" np_thru_hole circle (at ${def_neg}5.625 6.3 ${p.rot}) (size 1.5 1.5) (drill 1.5) (layers *.Cu *.Mask))
        `
        }
        if(p.param.reverse) {
          return `
        ${standard}
        ${pins('-', '')}
        ${pins('', '-')})
        `
        } else {
          return `
        ${standard}
        ${pins('-', '')})
        `
        }
      }
    };

    var slider = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
            class: 'T', // for Toggle
            side: 'F'
        },
        body: p => {

            const left = p.param.side == 'F' ? '-' : '';
            const right = p.param.side == 'F' ? '' : '-';

            return `
        
        (module E73:SPDT_C128955 (layer F.Cu) (tstamp 5BF2CC3C)

            ${p.at /* parametric position */}

            ${'' /* footprint reference */}
            (fp_text reference "${p.ref}" (at 0 0) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))
            (fp_text value "" (at 0 0) (layer F.SilkS) hide (effects (font (size 1.27 1.27) (thickness 0.15))))
            
            ${'' /* outline */}
            (fp_line (start 1.95 -1.35) (end -1.95 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 0 -1.35) (end -3.3 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start -3.3 -1.35) (end -3.3 1.5) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start -3.3 1.5) (end 3.3 1.5) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 3.3 1.5) (end 3.3 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
            (fp_line (start 0 -1.35) (end 3.3 -1.35) (layer ${p.param.side}.SilkS) (width 0.15))
            
            ${'' /* extra indicator for the slider */}
            (fp_line (start -1.95 -3.85) (end 1.95 -3.85) (layer Dwgs.User) (width 0.15))
            (fp_line (start 1.95 -3.85) (end 1.95 -1.35) (layer Dwgs.User) (width 0.15))
            (fp_line (start -1.95 -1.35) (end -1.95 -3.85) (layer Dwgs.User) (width 0.15))
            
            ${'' /* bottom cutouts */}
            (pad "" np_thru_hole circle (at 1.5 0) (size 1 1) (drill 0.9) (layers *.Cu *.Mask))
            (pad "" np_thru_hole circle (at -1.5 0) (size 1 1) (drill 0.9) (layers *.Cu *.Mask))

            ${'' /* pins */}
            (pad 1 smd rect (at ${right}2.25 2.075 ${p.rot}) (size 0.9 1.25) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.from.str})
            (pad 2 smd rect (at ${left}0.75 2.075 ${p.rot}) (size 0.9 1.25) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.to.str})
            (pad 3 smd rect (at ${left}2.25 2.075 ${p.rot}) (size 0.9 1.25) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask))
            
            ${'' /* side mounts */}
            (pad "" smd rect (at 3.7 -1.1 ${p.rot}) (size 0.9 0.9) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask))
            (pad "" smd rect (at 3.7 1.1 ${p.rot}) (size 0.9 0.9) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask))
            (pad "" smd rect (at -3.7 1.1 ${p.rot}) (size 0.9 0.9) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask))
            (pad "" smd rect (at -3.7 -1.1 ${p.rot}) (size 0.9 0.9) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask))
        )
        
        `
        }
    };

    var tactswitch = {
        nets: {
            from: undefined,
            to: undefined
        },
        params: {
            class: 'B', // for Button
        },
        body: p => `
    (module TACT_SWITCH_TVBP06 (layer F.Cu) (tedit 5B8CD44F)
    ${p.at /* parametric position */}
    
  (fp_text reference "${p.ref}" (at 0 -1.7) (layer F.SilkS) ${p.ref_hide}
    (effects (font (size 1 1) (thickness 0.15)))
  )
  (fp_text value SW_RST (at 0 2) (layer F.Fab) hide
    (effects (font (size 1 1) (thickness 0.15)))
  )
  (fp_text user RESET (at 0 0 -180) (layer F.SilkS)
    (effects (font (size 0.8 0.8) (thickness 0.15)))
  )
  (fp_text user RESET (at 0 0) (layer B.SilkS)
    (effects (font (size 0.8 0.8) (thickness 0.15)) (justify mirror))
  )
  (fp_line (start -3 -1.8) (end 2.9 -1.8) (layer B.SilkS) (width 0.15))
  (fp_line (start -3 -1.8) (end 3 -1.8) (layer B.SilkS) (width 0.15))
  (fp_line (start 3 1.7) (end -3 1.7) (layer B.SilkS) (width 0.15))
  (fp_line (start 3 -1.8) (end -3 -1.8) (layer F.SilkS) (width 0.15))
  (fp_line (start -3 1.7) (end 3 1.7) (layer F.SilkS) (width 0.15))
  (fp_line (start 3 -1.8) (end 3 -1.1) (layer F.SilkS) (width 0.15))
  (fp_line (start 3 1.7) (end 3 1.1) (layer F.SilkS) (width 0.15))
  (fp_line (start -3 1.7) (end -3 1.1) (layer F.SilkS) (width 0.15))
  (fp_line (start -3 -1.8) (end -3 -1.1) (layer F.SilkS) (width 0.15))
  (fp_line (start 3 -1.8) (end 3 -1.1) (layer B.SilkS) (width 0.15))
  (fp_line (start 3 1.7) (end 3 1.1) (layer B.SilkS) (width 0.15))
  (fp_line (start -3 1.7) (end -3 1.1) (layer B.SilkS) (width 0.15))
  (fp_line (start -3 -1.8) (end -3 -1.1) (layer B.SilkS) (width 0.15))
  (pad 1 thru_hole circle (at -3.25 0) (size 2 2) (drill 1.3) (layers *.Cu *.Mask) ${p.net.from.str})
  (pad 2 thru_hole circle (at 3.25 0) (size 2 2) (drill 1.3) (layers *.Cu *.Mask) ${p.net.to.str})
    
  (model "\${KICAD6_3DMODEL_DIR}/Button_Switch_SMD.3dshapes/SW_SPST_CK_RS282G05A3.wrl"
    (offset (xyz 0 0 0))
    (scale (xyz 1 1 1))
    (rotate (xyz 0 0 0))
  )
  
)
    
    `
    };

    var tentingpuck = {
        nets: {},
        params: {
            reverseSilks: false,
            centerHole: false,
            northHole: true,
            westHole: true,
            southHole: true,
            eastHole: true,
        },
        body: (p) => {
            let wordParts;
            if (p.param.reverseSilks) {
                wordParts = ["puck", "tenting"];
            } else {
                wordParts = ["tenting", "puck"];
            }

            return `
(module "Tenting Puck" (layer F.Cu) (tedit 5F09F7E8)
  ${p.at /* parametric position */}

  (fp_text reference "${p.ref}" (at 7.6835 1.4605) (layer F.Fab)
    ${p.ref_hide}
    (effects (font (size 1 1) (thickness 0.15)))
  )
  (fp_text value "Tenting Puck" (at 8.0645 -2.8575) (layer F.Fab)
    (effects (font (size 1 1) (thickness 0.15)))
  )
  (fp_circle (center 0 0) (end 20.55 0) (layer B.CrtYd) (width 0.55))
  (fp_line (start -1.6 19.05) (end -1.6 -19.05) (layer F.CrtYd) (width 0.2))
  (fp_line (start 1.6 19.05) (end 1.6 -19.05) (layer F.CrtYd) (width 0.2))
  (fp_line (start 17.6 10) (end 17.6 -10) (layer F.CrtYd) (width 0.2))
  (fp_line (start -17.6 10) (end -17.6 -10) (layer F.CrtYd) (width 0.2))
  (fp_arc (start 0 0) (end 2.8575 -20.32) (angle 11.96501412) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -2.8575 -20.32) (angle -11.96501674) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 2.8575 20.32) (angle -11.96501412) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -2.8575 20.32) (angle 11.96501128) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 20.32 -2.8575) (angle -11.96500792) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 20.32 2.8575) (angle 11.96501054) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -20.32 2.8575) (angle -11.96501412) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -20.32 -2.8575) (angle 11.96501674) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -2.8575 -20.32) (angle -11.96501054) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 2.8575 -20.32) (angle 11.96501937) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 20.32 -2.8575) (angle -11.96501674) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 20.32 2.8575) (angle 11.96501674) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 2.8575 20.32) (angle -11.96500792) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -2.8575 20.32) (angle 11.96500792) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -20.32 2.8575) (angle -11.96501054) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end -20.32 -2.8575) (angle 11.96500434) (layer B.SilkS) (width 0.2))
  (fp_text user ${wordParts[0]} (at -0.1905 6.858 ${p.rot + 90}) (layer F.SilkS)
    (effects (font (size 1 1) (thickness 0.1)))
  )
  (fp_text user ${wordParts[1]} (at -0.254 -6.0325 ${
            p.rot + 90
        }) (layer F.SilkS)
    (effects (font (size 1 1) (thickness 0.1)))
  )
  (fp_text user ${wordParts[0]} (at -0.254 -6.9215 ${
            p.rot + 90
        }) (layer B.SilkS)
    (effects (font (size 1 1) (thickness 0.1)) (justify mirror))
  )
  (fp_text user ${wordParts[1]} (at -0.1905 6.0325 ${
            p.rot + 90
        } unlocked) (layer B.SilkS)
    (effects (font (size 1 1) (thickness 0.1)) (justify mirror))
  )
  (fp_arc (start 0 0) (end 0 10.795) (angle 6) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 10.795) (angle -6) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 -10.795) (angle -6) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 -10.795) (angle 6) (layer F.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 10.795) (angle -6) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 -10.795) (angle 6) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 -10.795) (angle -6) (layer B.SilkS) (width 0.2))
  (fp_arc (start 0 0) (end 0 10.795) (angle 6) (layer B.SilkS) (width 0.2))
  (fp_poly (pts (xy -1.626755 14.081867) (xy -0.823809 13.279167) (xy -0.535441 13.282261) (xy -0.247073 13.285354)
    (xy -1.094297 14.145491) (xy -1.212222 14.265214) (xy -1.327021 14.381763) (xy -1.437475 14.493903)
    (xy -1.542367 14.600396) (xy -1.640479 14.700007) (xy -1.730594 14.7915) (xy -1.811493 14.873637)
    (xy -1.88196 14.945182) (xy -1.940776 15.0049) (xy -1.986723 15.051554) (xy -2.018584 15.083907)
    (xy -2.032365 15.097903) (xy -2.123209 15.190179) (xy -2.123209 12.448309) (xy -1.626755 12.448309)
    (xy -1.626755 14.081867)) (layer F.SilkS) (width 0.01))
  (fp_poly (pts (xy -0.819975 14.488398) (xy -0.797272 14.511261) (xy -0.762793 14.546792) (xy -0.718524 14.592884)
    (xy -0.666457 14.64743) (xy -0.608578 14.708324) (xy -0.546879 14.773459) (xy -0.483346 14.840729)
    (xy -0.419971 14.908027) (xy -0.358741 14.973246) (xy -0.301645 15.034281) (xy -0.250673 15.089024)
    (xy -0.207813 15.135369) (xy -0.175055 15.171209) (xy -0.154387 15.194438) (xy -0.152094 15.197129)
    (xy -0.123793 15.230764) (xy -0.743807 15.230764) (xy -0.917157 15.054695) (xy -0.970899 14.999952)
    (xy -1.021182 14.948439) (xy -1.064998 14.903259) (xy -1.099344 14.867513) (xy -1.121212 14.844304)
    (xy -1.124389 14.840812) (xy -1.158271 14.802997) (xy -0.997236 14.641653) (xy -0.947523 14.592198)
    (xy -0.903299 14.548873) (xy -0.867152 14.51416) (xy -0.84167 14.49054) (xy -0.829441 14.480492)
    (xy -0.82891 14.480309) (xy -0.819975 14.488398)) (layer F.SilkS) (width 0.01))
  (fp_poly (pts (xy 0.578279 12.94765) (xy 0.578471 13.05189) (xy 0.57896 13.148635) (xy 0.57971 13.235521)
    (xy 0.580686 13.310183) (xy 0.581855 13.370258) (xy 0.583182 13.413381) (xy 0.584631 13.437188)
    (xy 0.585539 13.441218) (xy 0.59797 13.434904) (xy 0.622816 13.418561) (xy 0.64695 13.401359)
    (xy 0.761647 13.330637) (xy 0.883863 13.281533) (xy 1.014246 13.253857) (xy 1.153447 13.247419)
    (xy 1.171259 13.248087) (xy 1.260894 13.254639) (xy 1.337377 13.266576) (xy 1.409029 13.286068)
    (xy 1.484167 13.315285) (xy 1.554018 13.347924) (xy 1.681951 13.423217) (xy 1.794871 13.515197)
    (xy 1.891765 13.622186) (xy 1.971623 13.742511) (xy 2.033433 13.874496) (xy 2.076185 14.016465)
    (xy 2.098866 14.166744) (xy 2.102427 14.256414) (xy 2.092136 14.408892) (xy 2.06078 14.553456)
    (xy 2.007635 14.692692) (xy 1.95038 14.799611) (xy 1.864668 14.919904) (xy 1.763055 15.024753)
    (xy 1.647722 15.113075) (xy 1.520847 15.183789) (xy 1.384611 15.235812) (xy 1.241192 15.268065)
    (xy 1.092771 15.279464) (xy 0.992525 15.274981) (xy 0.847917 15.2501) (xy 0.707349 15.203825)
    (xy 0.574176 15.137846) (xy 0.451756 15.053849) (xy 0.343444 14.953523) (xy 0.33505 14.944357)
    (xy 0.253919 14.840237) (xy 0.184227 14.722055) (xy 0.129061 14.596192) (xy 0.091508 14.469032)
    (xy 0.082639 14.422582) (xy 0.080026 14.394187) (xy 0.077681 14.344115) (xy 0.076212 14.293781)
    (xy 0.57255 14.293781) (xy 0.583122 14.39133) (xy 0.613554 14.485349) (xy 0.642208 14.539494)
    (xy 0.709142 14.627777) (xy 0.788623 14.698654) (xy 0.878055 14.751147) (xy 0.974841 14.784279)
    (xy 1.076382 14.797073) (xy 1.180083 14.788552) (xy 1.25291 14.769264) (xy 1.295907 14.753178)
    (xy 1.336812 14.735818) (xy 1.352979 14.728042) (xy 1.398265 14.697038) (xy 1.447588 14.650844)
    (xy 1.495645 14.595388) (xy 1.53713 14.536594) (xy 1.558618 14.498267) (xy 1.578799 14.454021)
    (xy 1.591444 14.415413) (xy 1.598801 14.373121) (xy 1.603119 14.317818) (xy 1.603401 14.312528)
    (xy 1.600033 14.205283) (xy 1.577177 14.107391) (xy 1.533525 14.013968) (xy 1.515755 13.985439)
    (xy 1.451213 13.907535) (xy 1.372396 13.845365) (xy 1.28276 13.799869) (xy 1.185761 13.771991)
    (xy 1.084857 13.762671) (xy 0.983505 13.772853) (xy 0.885159 13.803478) (xy 0.871156 13.809764)
    (xy 0.783204 13.862713) (xy 0.709214 13.930927) (xy 0.650171 14.011273) (xy 0.607058 14.10062)
    (xy 0.580856 14.195833) (xy 0.57255 14.293781) (xy 0.076212 14.293781) (xy 0.075628 14.273778)
    (xy 0.073889 14.184589) (xy 0.072486 14.07796) (xy 0.071442 13.955304) (xy 0.070778 13.818032)
    (xy 0.070517 13.667558) (xy 0.070514 13.655822) (xy 0.070427 12.964108) (xy 0.578131 12.454082)
    (xy 0.578279 12.94765)) (layer F.SilkS) (width 0.01))
  (fp_poly (pts (xy 0.777718 14.524575) (xy 0.755015 14.547438) (xy 0.720536 14.582969) (xy 0.676267 14.629061)
    (xy 0.6242 14.683607) (xy 0.566321 14.744501) (xy 0.504622 14.809636) (xy 0.441089 14.876906)
    (xy 0.377714 14.944204) (xy 0.316484 15.009423) (xy 0.259388 15.070458) (xy 0.208416 15.125201)
    (xy 0.165556 15.171546) (xy 0.132798 15.207386) (xy 0.11213 15.230615) (xy 0.109837 15.233306)
    (xy 0.081536 15.266941) (xy 0.70155 15.266941) (xy 0.8749 15.090872) (xy 0.928642 15.036129)
    (xy 0.978925 14.984616) (xy 1.022741 14.939436) (xy 1.057087 14.90369) (xy 1.078955 14.880481)
    (xy 1.082132 14.876989) (xy 1.116014 14.839174) (xy 0.954979 14.67783) (xy 0.905266 14.628375)
    (xy 0.861042 14.58505) (xy 0.824895 14.550337) (xy 0.799413 14.526717) (xy 0.787184 14.516669)
    (xy 0.786653 14.516486) (xy 0.777718 14.524575)) (layer B.SilkS) (width 0.01))
  (fp_poly (pts (xy -0.620536 12.983827) (xy -0.620728 13.088067) (xy -0.621217 13.184812) (xy -0.621967 13.271698)
    (xy -0.622943 13.34636) (xy -0.624112 13.406435) (xy -0.625439 13.449558) (xy -0.626888 13.473365)
    (xy -0.627796 13.477395) (xy -0.640227 13.471081) (xy -0.665073 13.454738) (xy -0.689207 13.437536)
    (xy -0.803904 13.366814) (xy -0.92612 13.31771) (xy -1.056503 13.290034) (xy -1.195704 13.283596)
    (xy -1.213516 13.284264) (xy -1.303151 13.290816) (xy -1.379634 13.302753) (xy -1.451286 13.322245)
    (xy -1.526424 13.351462) (xy -1.596275 13.384101) (xy -1.724208 13.459394) (xy -1.837128 13.551374)
    (xy -1.934022 13.658363) (xy -2.01388 13.778688) (xy -2.07569 13.910673) (xy -2.118442 14.052642)
    (xy -2.141123 14.202921) (xy -2.144684 14.292591) (xy -2.134393 14.445069) (xy -2.103037 14.589633)
    (xy -2.049892 14.728869) (xy -1.992637 14.835788) (xy -1.906925 14.956081) (xy -1.805312 15.06093)
    (xy -1.689979 15.149252) (xy -1.563104 15.219966) (xy -1.426868 15.271989) (xy -1.283449 15.304242)
    (xy -1.135028 15.315641) (xy -1.034782 15.311158) (xy -0.890174 15.286277) (xy -0.749606 15.240002)
    (xy -0.616433 15.174023) (xy -0.494013 15.090026) (xy -0.385701 14.9897) (xy -0.377307 14.980534)
    (xy -0.296176 14.876414) (xy -0.226484 14.758232) (xy -0.171318 14.632369) (xy -0.133765 14.505209)
    (xy -0.124896 14.458759) (xy -0.122283 14.430364) (xy -0.119938 14.380292) (xy -0.118469 14.329958)
    (xy -0.614807 14.329958) (xy -0.625379 14.427507) (xy -0.655811 14.521526) (xy -0.684465 14.575671)
    (xy -0.751399 14.663954) (xy -0.83088 14.734831) (xy -0.920312 14.787324) (xy -1.017098 14.820456)
    (xy -1.118639 14.83325) (xy -1.22234 14.824729) (xy -1.295167 14.805441) (xy -1.338164 14.789355)
    (xy -1.379069 14.771995) (xy -1.395236 14.764219) (xy -1.440522 14.733215) (xy -1.489845 14.687021)
    (xy -1.537902 14.631565) (xy -1.579387 14.572771) (xy -1.600875 14.534444) (xy -1.621056 14.490198)
    (xy -1.633701 14.45159) (xy -1.641058 14.409298) (xy -1.645376 14.353995) (xy -1.645658 14.348705)
    (xy -1.64229 14.24146) (xy -1.619434 14.143568) (xy -1.575782 14.050145) (xy -1.558012 14.021616)
    (xy -1.49347 13.943712) (xy -1.414653 13.881542) (xy -1.325017 13.836046) (xy -1.228018 13.808168)
    (xy -1.127114 13.798848) (xy -1.025762 13.80903) (xy -0.927416 13.839655) (xy -0.913413 13.845941)
    (xy -0.825461 13.89889) (xy -0.751471 13.967104) (xy -0.692428 14.04745) (xy -0.649315 14.136797)
    (xy -0.623113 14.23201) (xy -0.614807 14.329958) (xy -0.118469 14.329958) (xy -0.117885 14.309955)
    (xy -0.116146 14.220766) (xy -0.114743 14.114137) (xy -0.113699 13.991481) (xy -0.113035 13.854209)
    (xy -0.112774 13.703735) (xy -0.112771 13.691999) (xy -0.112684 13.000285) (xy -0.620388 12.490259)
    (xy -0.620536 12.983827)) (layer B.SilkS) (width 0.01))
  (fp_poly (pts (xy 1.584498 14.118044) (xy 0.781552 13.315344) (xy 0.493184 13.318438) (xy 0.204816 13.321531)
    (xy 1.05204 14.181668) (xy 1.169965 14.301391) (xy 1.284764 14.41794) (xy 1.395218 14.53008)
    (xy 1.50011 14.636573) (xy 1.598222 14.736184) (xy 1.688337 14.827677) (xy 1.769236 14.909814)
    (xy 1.839703 14.981359) (xy 1.898519 15.041077) (xy 1.944466 15.087731) (xy 1.976327 15.120084)
    (xy 1.990108 15.13408) (xy 2.080952 15.226356) (xy 2.080952 12.484486) (xy 1.584498 12.484486)
    (xy 1.584498 14.118044)) (layer B.SilkS) (width 0.01))
  ${
            !p.param.centerHole
                ? ""
                : `(pad "" thru_hole circle (at 0 0 ${p.rot}) (size 6.8 6.8) (drill 6.2) (layers *.Cu *.Mask))`
        }
  ${
            !p.param.northHole
                ? ""
                : "(pad 1 thru_hole circle (at 0 -19.05 " +
                p.rot +
                ") (size 4.4 4.4) (drill 2.2) (layers *.Cu *.Mask))"
        }
  ${
            !p.param.eastHole
                ? ""
                : "(pad 1 thru_hole circle (at 19.05  0 " +
                p.rot +
                ") (size 4.4 4.4) (drill 2.2) (layers *.Cu *.Mask))"
        }
  ${
            !p.param.southHole
                ? ""
                : "(pad 1 thru_hole circle (at 0  19.05 " +
                p.rot +
                ") (size 4.4 4.4) (drill 2.2) (layers *.Cu *.Mask))"
        }
  ${
            !p.param.westHole
                ? ""
                : "(pad 1 thru_hole circle (at -19.05 0 " +
                p.rot +
                ") (size 4.4 4.4) (drill 2.2) (layers *.Cu *.Mask))"
        }
)
    `;
        },
    };

    var trace = {
      params: {
        class: 'TRACE',
        side: "F",
        points: [[0,0], [10,10]],
        width: 0.2
      },
      body: p => p.param.points.map((point, index) => {
        const toPoint = p.param.points?.[index + 1];
        if (!toPoint) {
          return;
        }

        return (`
      (segment
      (start ${p.xy(point[0], point[1])})
      (end ${p.xy(toPoint[0], toPoint[1])})
      (width ${p.param.width})
      (layer "${p.param.side}.Cu")
      )
    `);
      }).join('\n')
    };

    // TRRS-PJ-320A-dual
    //     _________________
    //    | (1)     (3) (4)|
    //    |                |
    //    |___(2)__________|
    //
    // Nets
    //    A: corresponds to pin 1
    //    B: corresponds to pin 2
    //    C: corresponds to pin 3
    //    D: corresponds to pin 4
    // Params
    //    reverse: default is false
    //      if true, will flip the footprint such that the pcb can be reversible
    //    symmetric: default is false
    //      if true, will only work if reverse is also true
    //      this will cause the footprint to be symmetrical on each half
    //      pins 1 and 2 must be identical if symmetric is true, as they will overlap

    var trrs = {
      nets: {
        A: undefined,
        B: undefined,
        C: undefined,
        D: undefined
      },
      params: {
        class: 'TRRS',
        reverse: false,
        symmetric: false
      },
      body: p => {
        const standard = `
      (module TRRS-PJ-320A-dual (layer F.Cu) (tedit 5970F8E5)

      ${p.at /* parametric position */}   

      ${'' /* footprint reference */}
      (fp_text reference REF** (at 0 14.2) (layer Dwgs.User) (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value TRRS-PJ-320A-dual (at 0 -5.6) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))

      ${''/* corner marks */}
      (fp_line (start 0.5 -2) (end -5.1 -2) (layer Dwgs.User) (width 0.15))
      (fp_line (start -5.1 0) (end -5.1 -2) (layer Dwgs.User) (width 0.15))
      (fp_line (start 0.5 0) (end 0.5 -2) (layer Dwgs.User) (width 0.15))
      (fp_line (start -5.35 0) (end -5.35 12.1) (layer Dwgs.User) (width 0.15))
      (fp_line (start 0.75 0) (end 0.75 12.1) (layer Dwgs.User) (width 0.15))
      (fp_line (start 0.75 12.1) (end -5.35 12.1) (layer Dwgs.User) (width 0.15))
      (fp_line (start 0.75 0) (end -5.35 0) (layer Dwgs.User) (width 0.15))

      ${''/* stabilizers */}
      (pad "" np_thru_hole circle (at -2.3 8.6) (size 1.5 1.5) (drill 1.5) (layers *.Cu *.Mask))
      (pad "" np_thru_hole circle (at -2.3 1.6) (size 1.5 1.5) (drill 1.5) (layers *.Cu *.Mask))
      `;
        function pins(def_neg, def_pos) {
          return `
        (pad 1 thru_hole oval (at ${def_neg} 11.3 ${p.rot}) (size 1.6 2.2) (drill oval 0.9 1.5) (layers *.Cu *.Mask) ${p.net.A.str})
        (pad 2 thru_hole oval (at ${def_pos} 10.2 ${p.rot}) (size 1.6 2.2) (drill oval 0.9 1.5) (layers *.Cu *.Mask) ${p.net.B.str})
        (pad 3 thru_hole oval (at ${def_pos} 6.2 ${p.rot}) (size 1.6 2.2) (drill oval 0.9 1.5) (layers *.Cu *.Mask) ${p.net.C.str})
        (pad 4 thru_hole oval (at ${def_pos} 3.2 ${p.rot}) (size 1.6 2.2) (drill oval 0.9 1.5) (layers *.Cu *.Mask) ${p.net.D.str})
      `
        }
        if(p.param.reverse & p.param.symmetric) {
          return `
        ${standard}
        ${pins('0', '-4.6')}
        ${pins('-4.6', '0')})
      `
        } else if(p.param.reverse) {
            return `
          ${standard}
          ${pins('-4.6', '0')}
          ${pins('4.6', '0')})
        `
          } else {
            return `
          ${standard}
          ${pins('-4.6', '0')})
        `
          }
      }
    };

    var usbc = {
        nets: {
            GND: 'GND',
            SHIELD: 'SHIELD',
            VBUS: 'VBUS',
            VCC: 'VCC',
            CC1: 'CC1',
            CC2: 'CC2',
            DMIN: 'DMIN',
            DPLUS: 'DPLUS',
            P3: 'P3',
            P4: 'P4'
        },
        params: {
            class: 'USB',
            side: 'F',
            // By placing a model in the path specified below KiCad will show it in the 3D viewer
            model: './3d/USB-C-C168688.step'
        },
        body: p => `
          (module USB-C-12-Pin-MidMount (layer ${p.param.side}.Cu)
          ${p.at /* parametric position */}

          ${'' /* footprint reference */}
          (fp_text reference "${p.ref}" (at 0 0) (layer ${p.param.side}.SilkS) ${p.ref_hide} (effects (font (size 1.27 1.27) (thickness 0.15))))

          (fp_line (start -4.64 6.66) (end 4.64 6.66) (layer ${p.param.side}.CrtYd) (width 0.15))
          (fp_line (start -4.64 6.66) (end -4.64 0) (layer ${p.param.side}.CrtYd) (width 0.15))
          (fp_line (start 4.64 6.66) (end 4.64 0) (layer ${p.param.side}.CrtYd) (width 0.15))

          (pad "A1" smd rect (at 3.225 7.235 ${p.rot}) (size 0.6 1.15) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.GND.str})
          (pad "A4" smd rect (at 2.45 7.235 ${p.rot}) (size 0.6 1.15) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.VBUS.str})
          
          ${p.param.side === 'F' ? `
          (pad "B8" smd rect (at 1.75 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask))
          (pad "A5" smd rect (at 1.25 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask) ${p.net.CC2.str})
          (pad "B7" smd rect (at 0.75 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask) ${p.net.DMIN.str})
          (pad "A6" smd rect (at 0.25 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask) ${p.net.DPLUS.str})
          (pad "A7" smd rect (at -0.25 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask) ${p.net.DMIN.str})
          (pad "B6" smd rect (at -0.75 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask) ${p.net.DPLUS.str})
          (pad "A8" smd rect (at -1.25 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask))
          (pad "B5" smd rect (at -1.75 7.235 ${p.rot}) (size 0.3 1.15) (layers F.Cu F.Paste F.Mask) ${p.net.CC1.str})
          ` : `
          (pad "B5" smd rect (at 1.75 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask) ${p.net.CC1.str})
          (pad "A8" smd rect (at 1.25 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask))
          (pad "B6" smd rect (at 0.75 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask) ${p.net.DPLUS.str})
          (pad "A7" smd rect (at 0.25 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask) ${p.net.DMIN.str})
          (pad "A6" smd rect (at -0.25 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask) ${p.net.DPLUS.str})
          (pad "B7" smd rect (at -0.75 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask) ${p.net.DMIN.str})
          (pad "A5" smd rect (at -1.25 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask) ${p.net.CC2.str})
          (pad "B8" smd rect (at -1.75 7.235 ${p.rot}) (size 0.3 1.15) (layers B.Cu B.Paste B.Mask))
          `}
            
          (pad "A4" smd rect (at -2.45 7.235 ${p.rot}) (size 0.6 1.15) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.VBUS.str})
          (pad "A1" smd rect (at -3.225 7.235 ${p.rot}) (size 0.6 1.15) (layers ${p.param.side}.Cu ${p.param.side}.Paste ${p.param.side}.Mask) ${p.net.GND.str})
          (pad "S1" thru_hole oval (at 5.62 6.1 ${p.rot}) (size 1 1.8) (drill oval 0.6 1.4) (layers *.Cu *.Mask) ${p.net.SHIELD.str})
          (pad "S1" thru_hole oval (at -5.62 6.1 ${p.rot}) (size 1 1.8) (drill oval 0.6 1.4) (layers *.Cu *.Mask) ${p.net.SHIELD.str})
          (pad "S1" thru_hole oval (at -5.62 2.1 ${p.rot}) (size 1 2.2) (drill oval 0.6 1.8) (layers *.Cu *.Mask) ${p.net.SHIELD.str})
          (pad "S1" thru_hole oval (at 5.62 2.1 ${p.rot}) (size 1 2.2) (drill oval 0.6 1.8) (layers *.Cu *.Mask) ${p.net.SHIELD.str})
          
          (model ${p.param.model}
                (at (xyz 0 0 0))
                (scale (xyz 1 1 1))
                (rotate (xyz 0 0 180))
            )
          )
     `
    };

    // Via
    // Nets
    //		net: the net this via should be connected to

    var via = {
        nets: {
          net: undefined
        },
        body: p => `
      (module VIA-0.6mm (layer F.Cu) (tedit 591DBFB0)
      ${p.at /* parametric position */}   
      ${'' /* footprint reference */}
      (fp_text reference REF** (at 0 1.4) (layer F.SilkS) hide (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value VIA-0.6mm (at 0 -1.4) (layer F.Fab) hide (effects (font (size 1 1) (thickness 0.15))))

      ${'' /* via */}
      (pad 1 thru_hole circle (at 0 0) (size 0.6 0.6) (drill 0.3) (layers *.Cu) (zone_connect 2) ${p.net.net.str})
      )
    `
    };

    // Seeduino XIAO with vias for underside pads
    var xiao = {
        nets:   {
            VIN:    'VIN',
            SWDIO:  'SWDIO',
            SWDCLK: 'SWDCLK',
            RST:    'RST',
            GND:    'GND',
            P0:     'P0',
            P1:     'P1',
            P2:     'P2',
            P3:     'P3',
            P4:     'P4',
            P5:     'P5',
            P6:     'P6',
            P7:     'P7',
            P8:     'P8',
            P9:     'P9',
            P10:    'P10',
            RAW3V3: 'RAW3V3',
            RAW5V:  'RAW5V'
        },
        params: {
            class: 'MCU',
            side:  'F'
        },
        body:   p => `
      (module "Seeeduino XIAO-MOUDLE14P-2.54-21X17.8MM tht maybe" (layer "${ p.param.side }.Cu") (tedit 613ABEDD) (attr smd)
      ${ p.at /* parametric position */ }

  ${ ``/* Pads */ }
  (pad "1" smd oval (at 0.83312 -18.11782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P0.str })
  (pad "1" thru_hole circle (at 1.25 -18.11782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P0.str })
  (pad "2" thru_hole circle (at 1.25 -15.57782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P1.str })
  (pad "2" smd oval (at 0.83312 -15.57782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P1.str })
  (pad "3" smd oval (at 0.83312 -13.03782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P2.str })
  (pad "3" thru_hole circle (at 1.25 -13.03782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P2.str })
  (pad "4" smd oval (at 0.83312 -10.49782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P3.str })
  (pad "4" thru_hole circle (at 1.25 -10.49782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P3.str })
  (pad "5" thru_hole circle (at 1.25 -7.95782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P4.str })
  (pad "5" smd oval (at 0.83312 -7.95782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P4.str })
  (pad "6" smd oval (at 0.83312 -5.41782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P5.str })
  (pad "6" thru_hole circle (at 1.25 -5.41782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P5.str })
  (pad "7" thru_hole circle (at 1.25 -2.87782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P6.str })
  (pad "7" smd oval (at 0.83312 -2.87782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P6.str })
  (pad "8" thru_hole circle (at 16.581 -2.87782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P7.str })
  (pad "8" smd oval (at 16.99768 -2.87782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P7.str })
  (pad "9" smd oval (at 16.99768 -5.41782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask")  ${ p.net.P8.str })
  (pad "9" thru_hole circle (at 16.581 -5.41782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask)  ${ p.net.P8.str })
  (pad "10" smd oval (at 16.99768 -7.95782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P9.str })
  (pad "10" thru_hole circle (at 16.581 -7.95782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P9.str })
  (pad "11" thru_hole circle (at 16.581 -10.49782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.P10.str })
  (pad "11" smd oval (at 16.99768 -10.49782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.P10.str })
  (pad "12" smd oval (at 16.99768 -13.03782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.RAW3V3.str })
  (pad "12" thru_hole circle (at 16.581 -13.03782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.RAW3V3.str })
  (pad "13" smd oval (at 16.99768 -15.57782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.GND.str })
  (pad "13" thru_hole circle (at 16.581 -15.57782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.GND.str })
  (pad "14" thru_hole circle (at 16.581 -18.11782) (size 1.524 1.524) (drill 1) (layers *.Cu *.Mask) ${ p.net.RAW5V.str })
  (pad "14" thru_hole oval (at 16.99768 -18.11782 ${p.rot}) (size 2.74828 1.99898) (layers "${ p.param.side }.Cu" "${ p.param.side }.Paste" "${ p.param.side }.Mask") ${ p.net.RAW5V.str })
  (pad "15" thru_hole oval (at 7.7 -1.8 ${p.rot + 90 }) (size 2.032 1.016) (drill 0.3) (layers *.Cu *.Paste *.Mask) ${ p.net.VIN.str })
  (pad "16" thru_hole oval (at 10.25 -1.8 ${p.rot + 90 }) (size 2.032 1.016) (drill 0.3) (layers *.Cu *.Paste *.Mask) ${ p.net.GND.str })
  (pad "17" thru_hole circle (at 7.698803 -18.804187) (size 1.143 1.143) (drill 0.3) (layers *.Cu *.Paste *.Mask) ${ p.net.SWDIO.str })
  (pad "18" thru_hole circle (at 10.238803 -18.804187) (size 1.143 1.143) (drill 0.3) (layers *.Cu *.Paste *.Mask) ${ p.net.SWDCLK.str })
  (pad "19" thru_hole circle (at 7.698803 -16.264187) (size 1.143 1.143) (drill 0.3) (layers *.Cu *.Paste *.Mask) ${ p.net.RST.str })
  (pad "20" thru_hole circle (at 10.238803 -16.264187) (size 1.143 1.143) (drill 0.3) (layers *.Cu *.Paste *.Mask) ${ p.net.GND.str })

  ${ ``/* Silkscreen */ }
  (fp_line (start 13.39342 -22.42312) (end 13.39342 -15.06982) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 5.461 -18.415) (end 5.461 -21.082) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 4.3942 -15.06982) (end 4.3942 -22.42312) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 11.43 -17.78) (end 11.43 -20.32) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 14.097 -18.415) (end 14.097 -21.082) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 3.683 -18.415) (end 3.683 -21.082) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 12.319 -14.34846) (end 12.319 -17.018) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 3.683 -21.082) (end 5.461 -21.082) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 6.35 -3.175) (end 12.065 -3.175) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 12.319 -14.34846) (end 14.097 -14.34846) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 12.319 -18.415) (end 14.097 -18.415) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 12.319 -18.415) (end 12.319 -21.082) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 3.683 -17.018) (end 5.461 -17.018) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 14.097 -14.34846) (end 14.097 -17.018) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 13.39342 -15.06982) (end 4.3942 -15.06982) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 5.461 -14.34846) (end 5.461 -17.018) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 6.35 -20.32) (end 11.43 -20.32) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 6.35 -17.78) (end 6.35 -20.32) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 6.35 -0.635) (end 6.35 -3.175) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 0 0) (end 17.79778 0) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 12.319 -21.082) (end 14.097 -21.082) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 3.683 -18.415) (end 5.461 -18.415) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 3.683 -14.34846) (end 5.461 -14.34846) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 12.065 -0.635) (end 12.065 -3.175) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 6.35 -17.78) (end 11.43 -17.78) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 17.79778 0) (end 17.79778 -20.99818) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 0 -20.32762) (end 0 0) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 3.683 -14.34846) (end 3.683 -17.018) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 0.67056 -20.99818) (end 0 -20.32762) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 6.35 -0.635) (end 12.065 -0.635) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_line (start 17.79778 -20.99818) (end 0.67056 -20.99818) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 4.39928 -22.42312) (end 13.39342 -22.42312) (layer "${ p.param.side }.SilkS") (width 0.127))
  (fp_line (start 12.319 -17.018) (end 14.097 -17.018) (layer "${ p.param.side }.SilkS") (width 0.06604))
  (fp_circle (center -0.889 -18.161) (end -0.889 -18.415) (layer "${ p.param.side }.SilkS") (width 1))
)
     `
    };

    var footprints = {
        alps: alps,
        button: button,
        choc: choc,
        chocmini: chocmini,
        diode: diode,
        holyiot: holyiot,
        jstph: jstph,
        jumper: jumper,
        mountinghole: mountinghole,
        mx: mx,
        oled: oled,
        omron: omron,
        pad: pad,
        promicro: promicro,
        rawkicad: rawkicad,
        rgb: rgb,
        rotary: rotary,
        scrollwheel: scrollwheel,
        slider: slider,
        tactswitch: tactswitch,
        tentingpuck: tentingpuck,
        trace: trace,
        trrs: trrs,
        usbc: usbc,
        via: via,
        xiao: xiao,
    };

    const m = require$$0__default["default"];
    const a = assert$1;
    const prep = prepare$1;
    const anchor_lib = anchor$1;

    const kicad_prefix = `
(kicad_pcb (version 20171130) (host pcbnew 5.1.6)

  (page A3)
  (title_block
    (title KEYBOARD_NAME_HERE)
    (rev VERSION_HERE)
    (company YOUR_NAME_HERE)
  )

  (general
    (thickness 1.6)
  )

  (layers
    (0 F.Cu signal)
    (31 B.Cu signal)
    (32 B.Adhes user)
    (33 F.Adhes user)
    (34 B.Paste user)
    (35 F.Paste user)
    (36 B.SilkS user)
    (37 F.SilkS user)
    (38 B.Mask user)
    (39 F.Mask user)
    (40 Dwgs.User user)
    (41 Cmts.User user)
    (42 Eco1.User user)
    (43 Eco2.User user)
    (44 Edge.Cuts user)
    (45 Margin user)
    (46 B.CrtYd user)
    (47 F.CrtYd user)
    (48 B.Fab user)
    (49 F.Fab user)
  )

  (setup
    (last_trace_width 0.25)
    (trace_clearance 0.127)
    (zone_clearance 0.508)
    (zone_45_only no)
    (trace_min 0.127)
    (via_size 0.4)
    (via_drill 0.2)
    (via_min_size 0.4)
    (via_min_drill 0.2)
    (uvia_size 0.3)
    (uvia_drill 0.1)
    (uvias_allowed no)
    (uvia_min_size 0.2)
    (uvia_min_drill 0.1)
    (edge_width 0.05)
    (segment_width 0.2)
    (pcb_text_width 0.3)
    (pcb_text_size 1.5 1.5)
    (mod_edge_width 0.12)
    (mod_text_size 1 1)
    (mod_text_width 0.15)
    (pad_size 1.524 1.524)
    (pad_drill 0.762)
    (pad_to_mask_clearance 0.05)
    (aux_axis_origin 0 0)
    (visible_elements FFFFFF7F)
    (pcbplotparams
      (layerselection 0x010fc_ffffffff)
      (usegerberextensions false)
      (usegerberattributes true)
      (usegerberadvancedattributes true)
      (creategerberjobfile true)
      (excludeedgelayer true)
      (linewidth 0.100000)
      (plotframeref false)
      (viasonmask false)
      (mode 1)
      (useauxorigin false)
      (hpglpennumber 1)
      (hpglpenspeed 20)
      (hpglpendiameter 15.000000)
      (psnegative false)
      (psa4output false)
      (plotreference true)
      (plotvalue true)
      (plotinvisibletext false)
      (padsonsilk false)
      (subtractmaskfromsilk true)
      (outputformat 1)
      (mirror false)
      (drillshape 1)
      (scaleselection 1)
      (outputdirectory ""))
  )
`;

    const kicad_suffix = `
)
`;

    const kicad_default_netclass = `
  (net_class Default "This is the default net class."
    (clearance 0.127)
    (trace_width 0.13)
    (via_dia 0.4)
    (via_drill 0.2)
    (uvia_dia 0.3)
    (uvia_drill 0.1)
    __ADD_NET
  )
`;

    const kicad_power_netclass = `
  (net_class Power "This is the power net class."
    (clearance 0.2)
    (trace_width 0.3)
    (via_dia 0.8)
    (via_drill 0.4)
    (uvia_dia 0.3)
    (uvia_drill 0.1)
    __ADD_NET
  )
`;

    const makerjs2kicad = pcbs._makerjs2kicad = (model, layer='Edge.Cuts') => {
        const grs = [];
        const xy = val => `${val[0]} ${-val[1]}`;
        m.model.walk(model, {
            onPath: wp => {
                const p = wp.pathContext;
                switch (p.type) {
                    case 'line':
                        grs.push(`(gr_line (start ${xy(p.origin)}) (end ${xy(p.end)}) (angle 90) (layer ${layer}) (width 0.15))`);
                        break
                    case 'arc':
                        const arc_center = p.origin;
                        const angle_start = p.startAngle > p.endAngle ? p.startAngle - 360 : p.startAngle;
                        const angle_diff = Math.abs(p.endAngle - angle_start);
                        const arc_end = m.point.rotate(m.point.add(arc_center, [p.radius, 0]), angle_start, arc_center);
                        grs.push(`(gr_arc (start ${xy(arc_center)}) (end ${xy(arc_end)}) (angle ${-angle_diff}) (layer ${layer}) (width 0.15))`);
                        break
                    case 'circle':
                        const circle_center = p.origin;
                        const circle_end = m.point.add(circle_center, [p.radius, 0]);
                        grs.push(`(gr_circle (center ${xy(circle_center)}) (end ${xy(circle_end)}) (layer ${layer}) (width 0.15))`);
                        break
                    default:
                        throw new Error(`Can't convert path type "${p.type}" to kicad!`)
                }
            }
        });
        return grs.join('\n')
    };

    const footprint_types = footprints;

    pcbs.inject_footprint = (name, fp) => {
        footprint_types[name] = fp;
    };

    const footprint = pcbs._footprint = (config, name, points, point, net_indexer, component_indexer, units, extra) => {

        if (config === false) return ''

        // config sanitization
        a.unexpected(config, name, ['type', 'anchor', 'nets', 'anchors', 'params']);
        const type = a.in(config.type, `${name}.type`, Object.keys(footprint_types));
        let anchor = anchor_lib.parse(config.anchor || {}, `${name}.anchor`, points, true, point)(units);
        const nets = a.sane(config.nets || {}, `${name}.nets`, 'object')();
        const anchors = a.sane(config.anchors || {}, `${name}.anchors`, 'object')();
        const params = a.sane(config.params || {}, `${name}.params`, 'object')();

        // basic setup
        const fp = footprint_types[type];
        const parsed_params = {};

        // connecting other, non-net, non-anchor parameters
        parsed_params.param = {};
        for (const [param_name, param_value] of Object.entries(prep.extend(fp.params || {}, params))) {
            let value = param_value;
            if (a.type(value)() == 'string' && value.startsWith('=') && point) {
                const indirect = value.substring(1);
                value = point.meta[indirect];
                if (value === undefined) {
                    throw new Error(`Indirection "${name}.params.${param}" --> "${point.meta.name}.${indirect}" to undefined value!`)
                }
            }
            parsed_params.param[param_name] = value;
        }

        // reference
        const component_ref = parsed_params.ref = component_indexer(parsed_params.param.class || '_');
        parsed_params.ref_hide = extra.references ? '' : 'hide';

        // footprint positioning
        parsed_params.at = `(at ${anchor.x} ${-anchor.y} ${anchor.r})`;
        parsed_params.rot = anchor.r;
        parsed_params.xy = (x, y) => {
            const new_anchor = anchor_lib.parse({
                shift: [x, -y]
            }, '_internal_footprint_xy', points, true, anchor)(units);
            return `${new_anchor.x} ${-new_anchor.y}`
        };

        // connecting nets
        parsed_params.net = {};
        for (const [net_name, net_value] of Object.entries(prep.extend(fp.nets || {}, nets))) {
            let net = a.sane(net_value, `${name}.nets.${net_name}`, 'string')();
            if (net.startsWith('=') && point) {
                const indirect = net.substring(1);
                net = point.meta[indirect];
                net = a.sane(net, `${name}.nets.${net_name} --> ${point.meta.name}.${indirect}`, 'string')();
            }
            const index = net_indexer(net);
            parsed_params.net[net_name] = {
                name: net,
                index: index,
                str: `(net ${index} "${net}")`
            };
        }

        // allowing footprints to add dynamic nets
        parsed_params.local_net = suffix => {
            const net = `${component_ref}_${suffix}`;
            const index = net_indexer(net);
            return {
                name: net,
                index: index,
                str: `(net ${index} "${net}")`
            }
        };

        // parsing anchor-type parameters
        parsed_params.anchors = {};
        for (const [anchor_name, anchor_config] of Object.entries(prep.extend(fp.anchors || {}, anchors))) {
            let parsed_anchor = anchor_lib.parse(anchor_config || {}, `${name}.anchors.${anchor_name}`, points, true, anchor)(units);
            parsed_anchor.y = -parsed_anchor.y;
            parsed_params.anchors[anchor_name] = parsed_anchor;
        }

        return fp.body(parsed_params)
    };

    pcbs.parse = (config, points, outlines, units) => {

        const pcbs = a.sane(config.pcbs || {}, 'pcbs', 'object')();
        const results = {};

        for (const [pcb_name, pcb_config] of Object.entries(pcbs)) {

            // config sanitization
            a.unexpected(pcb_config, `pcbs.${pcb_name}`, ['outlines', 'footprints', 'references']);
            const references = a.sane(pcb_config.references || false, `pcbs.${pcb_name}.references`, 'boolean')();

            // outline conversion
            if (a.type(pcb_config.outlines)() == 'array') {
                pcb_config.outlines = {...pcb_config.outlines};
            }
            const config_outlines = a.sane(pcb_config.outlines || {}, `pcbs.${pcb_name}.outlines`, 'object')();
            const kicad_outlines = {};
            for (const [outline_name, outline] of Object.entries(config_outlines)) {
                const ref = a.in(outline.outline, `pcbs.${pcb_name}.outlines.${outline_name}.outline`, Object.keys(outlines));
                const layer = a.sane(outline.layer || 'Edge.Cuts', `pcbs.${pcb_name}.outlines.${outline_name}.outline`, 'string')();
                kicad_outlines[outline_name] = makerjs2kicad(outlines[ref], layer);
            }

            // making a global net index registry
            const nets = {"": 0};
            const net_indexer = net => {
                if (nets[net] !== undefined) return nets[net]
                const index = Object.keys(nets).length;
                return nets[net] = index
            };
            // and a component indexer
            const component_registry = {};
            const component_indexer = _class => {
                if (!component_registry[_class]) {
                    component_registry[_class] = 0;
                }
                component_registry[_class]++;
                return `${_class}${component_registry[_class]}`
            };

            const footprints = [];

            // key-level footprints
            for (const [p_name, point] of Object.entries(points)) {
                for (const [f_name, f] of Object.entries(point.meta.footprints || {})) {
                    footprints.push(footprint(f, `${p_name}.footprints.${f_name}`, points, point, net_indexer, component_indexer, units, {references}));
                }
            }

            // global one-off footprints
            if (a.type(pcb_config.footprints)() == 'array') {
                pcb_config.footprints = {...pcb_config.footprints};
            }
            const global_footprints = a.sane(pcb_config.footprints || {}, `pcbs.${pcb_name}.footprints`, 'object')();
            for (const [gf_name, gf] of Object.entries(global_footprints)) {
                footprints.push(footprint(gf, `pcbs.${pcb_name}.footprints.${gf_name}`, points, undefined, net_indexer, component_indexer, units, {references}));
            }

            // finalizing nets
            const nets_arr = [];
            const add_default_nets_arr = [];
            const add_power_nets_arr = [];
            for (const [net, index] of Object.entries(nets)) {
                nets_arr.push(`(net ${index} "${net}")`);
                if (['vcc', 'vdd', 'vbus', 'raw', 'gnd'].includes(net.toLowerCase())) {
                    add_power_nets_arr.push(`(add_net "${net}")`);
                } else {
                    add_default_nets_arr.push(`(add_net "${net}")`);
                }
            }

            const default_netclass = kicad_default_netclass.replace('__ADD_NET', add_default_nets_arr.join('\n'));
            const power_netclass = kicad_power_netclass.replace('__ADD_NET', add_power_nets_arr.join('\n'));
            const nets_text = nets_arr.join('\n');
            const footprint_text = footprints.join('\n');
            const outline_text = Object.values(kicad_outlines).join('\n');
            const personalized_prefix = kicad_prefix
                .replace('KEYBOARD_NAME_HERE', pcb_name)
                .replace('VERSION_HERE', config.meta && config.meta.version || 'v1.0.0')
                .replace('YOUR_NAME_HERE', config.meta && config.meta.author || 'Unknown');
            results[pcb_name] = `
            ${personalized_prefix}
            ${nets_text}
            ${default_netclass}
            ${power_netclass}
            ${footprint_text}
            ${outline_text}
            ${kicad_suffix}
        `;
        }

        return results
    };

    var name = "ergogen";
    var version$1 = "9.9.9-mveerd-3.1.0";
    var description = "Ergonomic keyboard layout generator";
    var author = "Bán Dénes <mr@zealot.hu>";
    var license = "MIT";
    var homepage = "https://ergogen.xyz";
    var repository = "github:ergogen/ergogen";
    var bugs = "https://github.com/ergogen/ergogen/issues";
    var main = "./src/ergogen.js";
    var bin = "./src/cli.js";
    var scripts = {
    	build: "rollup -c",
    	test: "mocha -r test/helpers/register test/index.js",
    	coverage: "nyc --reporter=html --reporter=text npm test"
    };
    var dependencies = {
    	"@jscad/openjscad": "github:ergogen/oldjscad",
    	"fs-extra": "^10.0.0",
    	"js-yaml": "^3.14.0",
    	"kle-serial": "github:ergogen/kle-serial#ergogen",
    	makerjs: "github:ergogen/maker.js#ergogen",
    	mathjs: "^10.0.0",
    	semver: "^7.3.5",
    	yargs: "^17.3.0"
    };
    var devDependencies = {
    	"@rollup/plugin-commonjs": "^21.0.1",
    	"@rollup/plugin-json": "^4.1.0",
    	chai: "^4.3.4",
    	"chai-as-promised": "^7.1.1",
    	"dir-compare": "^3.3.0",
    	glob: "^7.2.0",
    	mocha: "^9.1.3",
    	nyc: "^15.1.0",
    	rollup: "^2.61.1"
    };
    var nyc = {
    	all: true,
    	include: [
    		"src/**/*.js"
    	]
    };
    var require$$9 = {
    	name: name,
    	version: version$1,
    	description: description,
    	author: author,
    	license: license,
    	homepage: homepage,
    	repository: repository,
    	bugs: bugs,
    	main: main,
    	bin: bin,
    	scripts: scripts,
    	dependencies: dependencies,
    	devDependencies: devDependencies,
    	nyc: nyc
    };

    const u = utils;
    const io = io$1;
    const prepare = prepare$1;
    const units_lib = units;
    const points_lib = points;
    const outlines_lib = outlines;
    const cases_lib = cases;
    const pcbs_lib = pcbs;

    const semver = require$$8__default["default"];
    const version = require$$9.version;

    const process = async (raw, debug=false, logger=()=>{}) => {

        const prefix = 'Interpreting format: ';
        let empty = true;
        let [config, format] = io.interpret(raw, logger);
        let suffix = format;
        if (format == 'KLE') {
            suffix = `${format} (Auto-debug)`;
            debug = true;
        }
        logger(prefix + suffix);
        
        logger('Preprocessing input...');
        config = prepare.unnest(config);
        config = prepare.inherit(config);
        const results = {};
        if (debug) {
            results.raw = raw;
            results.canonical = u.deepcopy(config);
        }

        if (config.meta && config.meta.engine) {
            logger('Checking compatibility...');
            const engine = semver.validRange(config.meta.engine);
            if (!engine) {
                throw new Error('Invalid config engine declaration!')
            }
            if (!semver.satisfies(version, engine)) {
                throw new Error(`Current ergogen version (${version}) doesn\'t satisfy config's engine requirement (${engine})!`)
            }
        }

        logger('Calculating variables...');
        const units = units_lib.parse(config);
        if (debug) {
            results.units = units;
        }
        
        logger('Parsing points...');
        if (!config.points) {
            throw new Error('Input does not contain a points clause!')
        }
        const points = points_lib.parse(config.points, units);
        if (!Object.keys(points).length) {
            throw new Error('Input does not contain any points!')
        }
        if (debug) {
            results.points = points;
            results.demo = io.twodee(points_lib.visualize(points, units), debug);
        }

        logger('Generating outlines...');
        const outlines = outlines_lib.parse(config.outlines || {}, points, units);
        results.outlines = {};
        for (const [name, outline] of Object.entries(outlines)) {
            if (!debug && name.startsWith('_')) continue
            results.outlines[name] = io.twodee(outline, debug);
            empty = false;
        }

        logger('Extruding cases...');
        const cases = cases_lib.parse(config.cases || {}, outlines, units);
        results.cases = {};
        for (const [case_name, case_script] of Object.entries(cases)) {
            if (!debug && case_name.startsWith('_')) continue
            results.cases[case_name] = await io.threedee(case_script, debug);
            empty = false;
        }

        logger('Scaffolding PCBs...');
        const pcbs = pcbs_lib.parse(config, points, outlines, units);
        results.pcbs = {};
        for (const [pcb_name, pcb_text] of Object.entries(pcbs)) {
            if (!debug && pcb_name.startsWith('_')) continue
            results.pcbs[pcb_name] = pcb_text;
            empty = false;
        }

        if (!debug && empty) {
            logger('Output would be empty, rerunning in debug mode...');
            return process(raw, true, () => {})
        }
        return results
    };

    var ergogen = {
        version,
        process,
        inject_footprint: pcbs_lib.inject_footprint
    };

    return ergogen;

}));
