/*!
 * Ergogen v3.1.2
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

        // we only care about objects
        if (a$6.type(val)() !== 'object') {
            target[key] = val;
            return 
        }

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
            str = str.replace(new RegExp(`${par}`, 'g'), arg);
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
        keycaps: false
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
        if(p.param.reverse) {
          return `
        ${standard}
        ${p.param.keycaps ? keycap : ''}
        ${pins('-', '', 'B')}
        ${pins('', '-', 'F')})
        `
        } else {
          return `
        ${standard}
        ${p.param.keycaps ? keycap : ''}
        ${pins('-', '', 'B')})
        `
        }
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
            class: 'D'
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
    
        ${''/* SMD pads on both sides */}
        (pad 1 smd rect (at -1.65 0 ${p.rot}) (size 0.9 1.2) (layers F.Cu F.Paste F.Mask) ${p.net.to.str})
        (pad 2 smd rect (at 1.65 0 ${p.rot}) (size 0.9 1.2) (layers B.Cu B.Paste B.Mask) ${p.net.from.str})
        (pad 1 smd rect (at -1.65 0 ${p.rot}) (size 0.9 1.2) (layers B.Cu B.Paste B.Mask) ${p.net.to.str})
        (pad 2 smd rect (at 1.65 0 ${p.rot}) (size 0.9 1.2) (layers F.Cu F.Paste F.Mask) ${p.net.from.str})
        
        ${''/* THT terminals */}
        (pad 1 thru_hole circle (at 3.81 0 ${p.rot}) (size 1.905 1.905) (drill 0.9906) (layers *.Cu *.Mask) ${p.net.from.str})
        (pad 2 thru_hole rect (at -3.81 0 ${p.rot}) (size 1.778 1.778) (drill 0.9906) (layers *.Cu *.Mask) ${p.net.to.str})
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
          keycaps: false
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
        (pad 1 smd rect (at ${def_neg}7.085 -2.54 180) (size 2.55 2.5) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask) ${p.net.from.str})
        (pad 2 smd rect (at ${def_pos}5.842 -5.08 180) (size 2.55 2.5) (layers ${def_side}.Cu ${def_side}.Paste ${def_side}.Mask) ${p.net.to.str})
        `
          } else {
              return `
            ${''/* pins */}
            (pad 1 thru_hole circle (at ${def_pos}2.54 -5.08) (size 2.286 2.286) (drill 1.4986) (layers *.Cu *.Mask) ${p.net.from.str})
            (pad 2 thru_hole circle (at ${def_neg}3.81 -2.54) (size 2.286 2.286) (drill 1.4986) (layers *.Cu *.Mask) ${p.net.to.str})
          `
          }
        }
        if(p.param.reverse){
          return `
        ${standard}
        ${p.param.keycaps ? keycap : ''}
        ${pins('-', '', 'B')}
        ${pins('', '-', 'F')})
        `
        } else {
          return `
        ${standard}
        ${p.param.keycaps ? keycap : ''}
        ${pins('-', '', 'B')})
        `
        }
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
            class: 'ROT'
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
            (pad "" thru_hole rect (at -0.12 5.56 ${p.rot})  (size 3.2 2) (drill oval 2.8 1.5) (layers *.Cu *.Mask))
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

    var footprints = {
        alps: alps,
        button: button,
        choc: choc,
        chocmini: chocmini,
        diode: diode,
        jstph: jstph,
        jumper: jumper,
        mx: mx,
        oled: oled,
        omron: omron,
        pad: pad,
        promicro: promicro,
        rgb: rgb,
        rotary: rotary,
        scrollwheel: scrollwheel,
        slider: slider,
        trrs: trrs,
        via: via,
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
    (trace_clearance 0.2)
    (zone_clearance 0.508)
    (zone_45_only no)
    (trace_min 0.2)
    (via_size 0.8)
    (via_drill 0.4)
    (via_min_size 0.4)
    (via_min_drill 0.3)
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
      (subtractmaskfromsilk false)
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

    const kicad_netclass = `
  (net_class Default "This is the default net class."
    (clearance 0.2)
    (trace_width 0.25)
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
            const add_nets_arr = [];
            for (const [net, index] of Object.entries(nets)) {
                nets_arr.push(`(net ${index} "${net}")`);
                add_nets_arr.push(`(add_net "${net}")`);
            }

            const netclass = kicad_netclass.replace('__ADD_NET', add_nets_arr.join('\n'));
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
            ${netclass}
            ${footprint_text}
            ${outline_text}
            ${kicad_suffix}
        `;
        }

        return results
    };

    var name = "ergogen";
    var version$1 = "3.1.2";
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
        config = prepare.parameterize(config);
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
