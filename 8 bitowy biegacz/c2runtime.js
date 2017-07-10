﻿// 
var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
if (typeof Object.getPrototypeOf !== "function")
{
    if (typeof "test".__proto__ === "object")
    {
        Object.getPrototypeOf = function(object) {
            return object.__proto__;
        };
    }
    else
    {
        Object.getPrototypeOf = function(object) {
            return object.constructor.prototype;
        };
    }
}
(function(){
    cr.logexport = function (msg)
    {
        if (console && console.log)
            console.log(msg);
    };
    cr.seal = function(x)
    {
        return x;
    };
    cr.freeze = function(x)
    {
        return x;
    };
    cr.is_undefined = function (x)
    {
        return typeof x === "undefined";
    };
    cr.is_number = function (x)
    {
        return typeof x === "number";
    };
    cr.is_string = function (x)
    {
        return typeof x === "string";
    };
    cr.isPOT = function (x)
    {
        return x > 0 && ((x - 1) & x) === 0;
    };
    cr.abs = function (x)
    {
        return (x < 0 ? -x : x);
    };
    cr.max = function (a, b)
    {
        return (a > b ? a : b);
    };
    cr.min = function (a, b)
    {
        return (a < b ? a : b);
    };
    cr.PI = Math.PI;
    cr.round = function (x)
    {
        return (x + 0.5) | 0;
    };
    cr.floor = function (x)
    {
        return x | 0;
    };
    function Vector2(x, y)
    {
        this.x = x;
        this.y = y;
        cr.seal(this);
    };
    Vector2.prototype.offset = function (px, py)
    {
        this.x += px;
        this.y += py;
        return this;
    };
    Vector2.prototype.mul = function (px, py)
    {
        this.x *= px;
        this.y *= py;
        return this;
    };
    cr.vector2 = Vector2;
    cr.segments_intersect = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)
    {
        if (cr.max(a1x, a2x) < cr.min(b1x, b2x)
         || cr.min(a1x, a2x) > cr.max(b1x, b2x)
         || cr.max(a1y, a2y) < cr.min(b1y, b2y)
         || cr.min(a1y, a2y) > cr.max(b1y, b2y))
        {
            return false;
        }
        var dpx = b1x - a1x + b2x - a2x;
        var dpy = b1y - a1y + b2y - a2y;
        var qax = a2x - a1x;
        var qay = a2y - a1y;
        var qbx = b2x - b1x;
        var qby = b2y - b1y;
        var d = cr.abs(qay * qbx - qby * qax);
        var la = qbx * dpy - qby * dpx;
        var lb = qax * dpy - qay * dpx;
        return cr.abs(la) <= d && cr.abs(lb) <= d;
    };
    function Rect(left, top, right, bottom)
    {
        this.set(left, top, right, bottom);
        cr.seal(this);
    };
    Rect.prototype.set = function (left, top, right, bottom)
    {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    };
    Rect.prototype.width = function ()
    {
        return this.right - this.left;
    };
    Rect.prototype.height = function ()
    {
        return this.bottom - this.top;
    };
    Rect.prototype.offset = function (px, py)
    {
        this.left += px;
        this.top += py;
        this.right += px;
        this.bottom += py;
        return this;
    };
    Rect.prototype.intersects_rect = function (rc)
    {
        return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom);
    };
    Rect.prototype.contains_pt = function (x, y)
    {
        return (x >= this.left && x <= this.right) && (y >= this.top && y <= this.bottom);
    };
    cr.rect = Rect;
    function Quad()
    {
        this.tlx = 0;
        this.tly = 0;
        this.trx = 0;
        this.try_ = 0;  // is a keyword otherwise!
        this.brx = 0;
        this.bry = 0;
        this.blx = 0;
        this.bly = 0;
        cr.seal(this);
    };
    Quad.prototype.set_from_rect = function (rc)
    {
        this.tlx = rc.left;
        this.tly = rc.top;
        this.trx = rc.right;
        this.try_ = rc.top;
        this.brx = rc.right;
        this.bry = rc.bottom;
        this.blx = rc.left;
        this.bly = rc.bottom;
    };
    Quad.prototype.set_from_rotated_rect = function (rc, a)
    {
        if (a === 0)
        {
            this.set_from_rect(rc);
        }
        else
        {
            var sin_a = Math.sin(a);
            var cos_a = Math.cos(a);
            var left_sin_a = rc.left * sin_a;
            var top_sin_a = rc.top * sin_a;
            var right_sin_a = rc.right * sin_a;
            var bottom_sin_a = rc.bottom * sin_a;
            var left_cos_a = rc.left * cos_a;
            var top_cos_a = rc.top * cos_a;
            var right_cos_a = rc.right * cos_a;
            var bottom_cos_a = rc.bottom * cos_a;
            this.tlx = left_cos_a - top_sin_a;
            this.tly = top_cos_a + left_sin_a;
            this.trx = right_cos_a - top_sin_a;
            this.try_ = top_cos_a + right_sin_a;
            this.brx = right_cos_a - bottom_sin_a;
            this.bry = bottom_cos_a + right_sin_a;
            this.blx = left_cos_a - bottom_sin_a;
            this.bly = bottom_cos_a + left_sin_a;
        }
    };
    Quad.prototype.offset = function (px, py)
    {
        this.tlx += px;
        this.tly += py;
        this.trx += px;
        this.try_ += py;
        this.brx += px;
        this.bry += py;
        this.blx += px;
        this.bly += py;
        return this;
    };
    Quad.prototype.bounding_box = function (rc)
    {
        rc.left =   cr.min(cr.min(this.tlx, this.trx),  cr.min(this.brx, this.blx));
        rc.top =    cr.min(cr.min(this.tly, this.try_), cr.min(this.bry, this.bly));
        rc.right =  cr.max(cr.max(this.tlx, this.trx),  cr.max(this.brx, this.blx));
        rc.bottom = cr.max(cr.max(this.tly, this.try_), cr.max(this.bry, this.bly));
    };
    Quad.prototype.contains_pt = function (x, y)
    {
        var v0x = this.trx - this.tlx;
        var v0y = this.try_ - this.tly;
        var v1x = this.brx - this.tlx;
        var v1y = this.bry - this.tly;
        var v2x = x - this.tlx;
        var v2y = y - this.tly;
        var dot00 = v0x * v0x + v0y * v0y
        var dot01 = v0x * v1x + v0y * v1y
        var dot02 = v0x * v2x + v0y * v2y
        var dot11 = v1x * v1x + v1y * v1y
        var dot12 = v1x * v2x + v1y * v2y
        var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        if ((u >= 0.0) && (v > 0.0) && (u + v < 1))
            return true;
        v0x = this.blx - this.tlx;
        v0y = this.bly - this.tly;
        var dot00 = v0x * v0x + v0y * v0y
        var dot01 = v0x * v1x + v0y * v1y
        var dot02 = v0x * v2x + v0y * v2y
        invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
        u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        return (u >= 0.0) && (v > 0.0) && (u + v < 1);
    };
    Quad.prototype.at = function (i, xory)
    {
        i = i % 4;
        if (i < 0)
            i += 4;
        switch (i)
        {
            case 0: return xory ? this.tlx : this.tly;
            case 1: return xory ? this.trx : this.try_;
            case 2: return xory ? this.brx : this.bry;
            case 3: return xory ? this.blx : this.bly;
            default: return xory ? this.tlx : this.tly;
        }
    };
    Quad.prototype.midX = function ()
    {
        return (this.tlx + this.trx  + this.brx + this.blx) / 4;
    };
    Quad.prototype.midY = function ()
    {
        return (this.tly + this.try_ + this.bry + this.bly) / 4;
    };
    Quad.prototype.intersects_quad = function (rhs)
    {
        var midx = rhs.midX();
        var midy = rhs.midY();
        if (this.contains_pt(midx, midy))
            return true;
        midx = this.midX();
        midy = this.midY();
        if (rhs.contains_pt(midx, midy))
            return true;
        var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
        var i, j;
        for (i = 0; i < 4; i++)
        {
            for (j = 0; j < 4; j++)
            {
                a1x = this.at(i, true);
                a1y = this.at(i, false);
                a2x = this.at(i + 1, true);
                a2y = this.at(i + 1, false);
                b1x = rhs.at(j, true);
                b1y = rhs.at(j, false);
                b2x = rhs.at(j + 1, true);
                b2y = rhs.at(j + 1, false);
                if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
                    return true;
            }
        }
        return false;
    };
    cr.quad = Quad;
    cr.RGB = function (red, green, blue)
    {
        return Math.max(Math.min(red, 255), 0)
             | (Math.max(Math.min(green, 255), 0) << 8)
             | (Math.max(Math.min(blue, 255), 0) << 16);
    };
    cr.GetRValue = function (rgb)
    {
        return rgb & 0xFF;
    };
    cr.GetGValue = function (rgb)
    {
        return (rgb & 0xFF00) >> 8;
    };
    cr.GetBValue = function (rgb)
    {
        return (rgb & 0xFF0000) >> 16;
    };
    cr.shallowCopy = function (a, b, allowOverwrite)
    {
        var attr;
        for (attr in b)
        {
            if (b.hasOwnProperty(attr))
            {
;
                a[attr] = b[attr];
            }
        }
        return a;
    };
    cr.arrayRemove = function (arr, index)
    {
        var i, len;
        index = cr.floor(index);
        if (index < 0 || index >= arr.length)
            return;                         // index out of bounds
        if (index === 0)                    // removing first item
            arr.shift();
        else if (index === arr.length - 1)  // removing last item
            arr.pop();
        else
        {
            for (i = index, len = arr.length - 1; i < len; i++)
                arr[i] = arr[i + 1];
            arr.length = len;
        }
    };
    cr.shallowAssignArray = function(dest, src)
    {
        dest.length = src.length;
        var i, len;
        for (i = 0, len = src.length; i < len; i++)
            dest[i] = src[i];
    };
    cr.arrayFindRemove = function (arr, item)
    {
        var index = arr.indexOf(item);
        if (index !== -1)
            cr.arrayRemove(arr, index);
    };
    cr.clamp = function(x, a, b)
    {
        if (x < a)
            return a;
        else if (x > b)
            return b;
        else
            return x;
    };
    cr.to_radians = function(x)
    {
        return x / (180.0 / cr.PI);
    };
    cr.to_degrees = function(x)
    {
        return x * (180.0 / cr.PI);
    };
    cr.clamp_angle_degrees = function (a)
    {
        a %= 360;       // now in (-360, 360) range
        if (a < 0)
            a += 360;   // now in [0, 360) range
        return a;
    };
    cr.clamp_angle = function (a)
    {
        a %= 2 * cr.PI;       // now in (-2pi, 2pi) range
        if (a < 0)
            a += 2 * cr.PI;   // now in [0, 2pi) range
        return a;
    };
    cr.to_clamped_degrees = function (x)
    {
        return cr.clamp_angle_degrees(cr.to_degrees(x));
    };
    cr.to_clamped_radians = function (x)
    {
        return cr.clamp_angle(cr.to_radians(x));
    };
    cr.angleTo = function(x1, y1, x2, y2)
    {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.atan2(dy, dx);
    };
    cr.angleDiff = function (a1, a2)
    {
        if (a1 === a2)
            return 0;
        var s1 = Math.sin(a1);
        var c1 = Math.cos(a1);
        var s2 = Math.sin(a2);
        var c2 = Math.cos(a2);
        var n = s1 * s2 + c1 * c2;
        if (n >= 1)
            return 0;
        if (n <= -1)
            return cr.PI;
        return Math.acos(n);
    };
    cr.angleRotate = function (start, end, step)
    {
        var ss = Math.sin(start);
        var cs = Math.cos(start);
        var se = Math.sin(end);
        var ce = Math.cos(end);
        if (Math.acos(ss * se + cs * ce) > step)
        {
            if (cs * se - ss * ce > 0)
                return cr.clamp_angle(start + step);
            else
                return cr.clamp_angle(start - step);
        }
        else
            return cr.clamp_angle(end);
    };
    cr.angleClockwise = function (a1, a2)
    {
        var s1 = Math.sin(a1);
        var c1 = Math.cos(a1);
        var s2 = Math.sin(a2);
        var c2 = Math.cos(a2);
        return c1 * s2 - s1 * c2 <= 0;
    };
    cr.distanceTo = function(x1, y1, x2, y2)
    {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx*dx + dy*dy);
    };
    cr.xor = function (x, y)
    {
        return !x !== !y;
    };
    cr.lerp = function (a, b, x)
    {
        return a + (b - a) * x;
    };
    cr.wipe = function (obj)
    {
        var p;
        for (p in obj)
        {
            if (obj.hasOwnProperty(p))
                delete obj[p];
        }
    };
    function ObjectSet_()
    {
        this.items = {};
        this.item_count = 0;
        this.values_cache = [];
        this.cache_valid = true;
        cr.seal(this);
    };
    ObjectSet_.prototype.contains = function (x)
    {
        return this.items.hasOwnProperty(x.toString());
    };
    ObjectSet_.prototype.add = function (x)
    {
        if (!this.contains(x))
        {
            this.items[x.toString()] = x;
            this.item_count++;
            this.cache_valid = false;
        }
        return this;
    };
    ObjectSet_.prototype.remove = function (x)
    {
        if (this.contains(x))
        {
            delete this.items[x.toString()];
            this.item_count--;
            this.cache_valid = false;
        }
        return this;
    };
    ObjectSet_.prototype.clear = function ()
    {
        cr.wipe(this.items);
        this.item_count = 0;
        this.values_cache.length = 0;
        this.cache_valid = true;
        return this;
    };
    ObjectSet_.prototype.isEmpty = function ()
    {
        return this.item_count === 0;
    };
    ObjectSet_.prototype.count = function ()
    {
        return this.item_count;
    };
    ObjectSet_.prototype.update_cache = function ()
    {
        if (this.cache_valid)
            return;
        this.values_cache.length = this.item_count;
        var p, n = 0;
        for (p in this.items)
        {
            if (this.items.hasOwnProperty(p))
                this.values_cache[n++] = this.items[p];
        }
;
        this.cache_valid = true;
    };
    ObjectSet_.prototype.values = function ()
    {
        this.update_cache();
        return this.values_cache.slice(0);
    };
    ObjectSet_.prototype.valuesRef = function ()
    {
        this.update_cache();
        return this.values_cache;
    };
    cr.ObjectSet = ObjectSet_;
    function KahanAdder_()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
        cr.seal(this);
    };
    KahanAdder_.prototype.add = function (v)
    {
        this.y = v - this.c;
        this.t = this.sum + this.y;
        this.c = (this.t - this.sum) - this.y;
        this.sum = this.t;
    };
    KahanAdder_.prototype.reset = function ()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
    };
    cr.KahanAdder = KahanAdder_;
    cr.regexp_escape = function(text)
    {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };
    function CollisionPoly_(pts_array_)
    {
        this.pts_cache = [];
        this.set_pts(pts_array_);
        cr.seal(this);
    };
    CollisionPoly_.prototype.set_pts = function(pts_array_)
    {
        this.pts_array = pts_array_;
        this.pts_count = pts_array_.length / 2;         // x, y, x, y... in array
        this.pts_cache.length = pts_array_.length;
        this.cache_width = -1;
        this.cache_height = -1;
        this.cache_angle = 0;
    };
    CollisionPoly_.prototype.is_empty = function()
    {
        return !this.pts_array.length;
    };
    CollisionPoly_.prototype.set_from_quad = function(q, offx, offy, w, h)
    {
        this.pts_cache.length = 8;
        this.pts_count = 4;
        var myptscache = this.pts_cache;
        myptscache[0] = q.tlx - offx;
        myptscache[1] = q.tly - offy;
        myptscache[2] = q.trx - offx;
        myptscache[3] = q.try_ - offy;
        myptscache[4] = q.brx - offx;
        myptscache[5] = q.bry - offy;
        myptscache[6] = q.blx - offx;
        myptscache[7] = q.bly - offy;
        this.cache_width = w;
        this.cache_height = h;
    };
    CollisionPoly_.prototype.cache_poly = function(w, h, a)
    {
        if (this.cache_width === w && this.cache_height === h && this.cache_angle === a)
            return;     // cache up-to-date
        this.cache_width = w;
        this.cache_height = h;
        this.cache_angle = a;
        var i, len, x, y;
        var sina = 0;
        var cosa = 1;
        var myptsarray = this.pts_array;
        var myptscache = this.pts_cache;
        if (a !== 0)
        {
            sina = Math.sin(a);
            cosa = Math.cos(a);
        }
        for (i = 0, len = this.pts_count; i < len; i++)
        {
            x = myptsarray[i*2] * w;
            y = myptsarray[i*2+1] * h;
            myptscache[i*2] = (x * cosa) - (y * sina);
            myptscache[i*2+1] = (y * cosa) + (x * sina);
        }
    };
    CollisionPoly_.prototype.contains_pt = function (a2x, a2y)
    {
        var myptscache = this.pts_cache;
        if (a2x === myptscache[0] && a2y === myptscache[1])
            return true;
        var a1x = -this.cache_width * 5 - 1;
        var a1y = -this.cache_height * 5 - 1;
        var a3x = this.cache_width * 5 + 1;
        var a3y = -1;
        var b1x, b1y, b2x, b2y;
        var i, len;
        var count1 = 0, count2 = 0;
        for (i = 0, len = this.pts_count; i < len; i++)
        {
            b1x = myptscache[i*2];
            b1y = myptscache[i*2+1];
            b2x = myptscache[((i+1)%len)*2];
            b2y = myptscache[((i+1)%len)*2+1];
            if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
                count1++;
            if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y))
                count2++;
        }
        return (count1 % 2 === 1) || (count2 % 2 === 1);
    };
    CollisionPoly_.prototype.intersects_poly = function (rhs, offx, offy)
    {
        var rhspts = rhs.pts_cache;
        var mypts = this.pts_cache;
        if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy))
            return true;
        if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy))
            return true;
        var i, leni, j, lenj;
        var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
        for (i = 0, leni = this.pts_count; i < leni; i++)
        {
            a1x = mypts[i*2];
            a1y = mypts[i*2+1];
            a2x = mypts[((i+1)%leni)*2];
            a2y = mypts[((i+1)%leni)*2+1];
            for (j = 0, lenj = rhs.pts_count; j < lenj; j++)
            {
                b1x = rhspts[j*2] + offx;
                b1y = rhspts[j*2+1] + offy;
                b2x = rhspts[((j+1)%lenj)*2] + offx;
                b2y = rhspts[((j+1)%lenj)*2+1] + offy;
                if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
                    return true;
            }
        }
        return false;
    };
    cr.CollisionPoly = CollisionPoly_;
    var fxNames = [ "lighter",
                    "xor",
                    "copy",
                    "destination-over",
                    "source-in",
                    "destination-in",
                    "source-out",
                    "destination-out",
                    "source-atop",
                    "destination-atop"];
    cr.effectToCompositeOp = function(effect)
    {
        if (effect <= 0 || effect >= 11)
            return "source-over";
        return fxNames[effect - 1]; // not including "none" so offset by 1
    };
    cr.setGLBlend = function(this_, effect, gl)
    {
        if (!gl)
            return;
        this_.srcBlend = gl.ONE;
        this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
        switch (effect) {
        case 1:     // lighter (additive)
            this_.srcBlend = gl.ONE;
            this_.destBlend = gl.ONE;
            break;
        case 2:     // xor
            break;  // todo
        case 3:     // copy
            this_.srcBlend = gl.ONE;
            this_.destBlend = gl.ZERO;
            break;
        case 4:     // destination-over
            this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
            this_.destBlend = gl.ONE;
            break;
        case 5:     // source-in
            this_.srcBlend = gl.DST_ALPHA;
            this_.destBlend = gl.ZERO;
            break;
        case 6:     // destination-in
            this_.srcBlend = gl.ZERO;
            this_.destBlend = gl.SRC_ALPHA;
            break;
        case 7:     // source-out
            this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
            this_.destBlend = gl.ZERO;
            break;
        case 8:     // destination-out
            this_.srcBlend = gl.ZERO;
            this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case 9:     // source-atop
            this_.srcBlend = gl.DST_ALPHA;
            this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
            break;
        case 10:    // destination-atop
            this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
            this_.destBlend = gl.SRC_ALPHA;
            break;
        }
    };
    cr.round6dp = function (x)
    {
        return Math.round(x * 1000000) / 1000000;
    };
}());
var MatrixArray=typeof Float32Array!=="undefined"?Float32Array:Array,glMatrixArrayType=MatrixArray,vec3={},mat3={},mat4={},quat4={};vec3.create=function(a){var b=new MatrixArray(3);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2]);return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a===c)return a[0]+=b[0],a[1]+=b[1],a[2]+=b[2],a;c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a===c)return a[0]-=b[0],a[1]-=b[1],a[2]-=b[2],a;c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a===c)return a[0]*=b,a[1]*=b,a[2]*=b,a;c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g===1)return b[0]=c,b[1]=d,b[2]=e,b}else return b[0]=0,b[1]=0,b[2]=0,b;g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1],a=a[2],g=b[0],f=b[1],b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1],a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1],a=a[2]-b[2],b=Math.sqrt(d*d+e*e+a*a);if(!b)return c[0]=0,c[1]=0,c[2]=0,c;b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};
mat3.create=function(a){var b=new MatrixArray(9);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8]);return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[15]=1;b[14]=0;b[13]=0;b[12]=0;b[11]=0;b[10]=a[8];b[9]=a[7];b[8]=a[6];b[7]=0;b[6]=a[5];b[5]=a[4];b[4]=a[3];b[3]=0;b[2]=a[2];b[1]=a[1];b[0]=a[0];return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};mat4.create=function(a){var b=new MatrixArray(16);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8],b[9]=a[9],b[10]=a[10],b[11]=a[11],b[12]=a[12],b[13]=a[13],b[14]=a[14],b[15]=a[15]);return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],n=a[11],o=a[12],m=a[13],p=a[14],a=a[15];return o*k*h*e-j*m*h*e-o*f*l*e+g*m*l*e+j*f*p*e-g*k*p*e-o*k*d*i+j*m*d*i+o*c*l*i-b*m*l*i-j*c*p*i+b*k*p*i+o*f*d*n-g*m*d*n-o*c*h*n+b*m*h*n+g*c*p*n-b*f*p*n-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],n=a[10],o=a[11],m=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*m,y=k*r-n*m,z=k*s-o*m,C=l*r-n*p,D=l*s-o*p,E=n*s-o*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+n*v-o*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-m*w+r*t-s*B)*q;b[7]=(k*w-n*t+o*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(m*v-p*t+s*A)*q;b[11]=(-k*v+l*t-o*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-m*u+p*B-r*A)*q;b[15]=(k*u-l*B+n*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,n=-k*g+h*i,o=j*g-f*i,m=c*l+d*n+e*o;if(!m)return null;m=1/m;b||(b=mat3.create());b[0]=l*m;b[1]=(-k*d+e*j)*m;b[2]=(h*d-e*f)*m;b[3]=n*m;b[4]=(k*c-e*i)*m;b[5]=(-h*c+e*g)*m;b[6]=o*m;b[7]=(-j*c+d*i)*m;b[8]=(f*c-d*g)*m;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],n=a[9],o=a[10],m=a[11],p=a[12],r=a[13],s=a[14],a=a[15],A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14],b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*n+u*r;c[2]=A*g+B*j+t*o+u*s;c[3]=A*f+B*k+t*m+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*n+y*r;c[6]=v*g+w*j+x*o+y*s;c[7]=v*f+w*k+x*m+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*n+E*r;c[10]=z*g+C*
j+D*o+E*s;c[11]=z*f+C*k+D*m+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*n+b*r;c[14]=q*g+F*j+G*o+b*s;c[15]=q*f+F*k+G*m+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1],b=b[2],g,f,h,i,j,k,l,n,o,m,p,r;if(!c||a===c)return a[12]=a[0]*d+a[4]*e+a[8]*b+a[12],a[13]=a[1]*d+a[5]*e+a[9]*b+a[13],a[14]=a[2]*d+a[6]*e+a[10]*b+a[14],a[15]=a[3]*d+a[7]*e+a[11]*b+a[15],a;g=a[0];f=a[1];h=a[2];i=a[3];j=a[4];k=a[5];l=a[6];n=a[7];o=a[8];m=a[9];p=a[10];r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=n;c[8]=o;c[9]=m;c[10]=p;c[11]=r;c[12]=g*d+j*e+o*b+a[12];c[13]=f*d+k*e+m*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+n*e+r*b+a[15];
return c};mat4.scale=function(a,b,c){var d=b[0],e=b[1],b=b[2];if(!c||a===c)return a[0]*=d,a[1]*=d,a[2]*=d,a[3]*=d,a[4]*=e,a[5]*=e,a[6]*=e,a[7]*=e,a[8]*=b,a[9]*=b,a[10]*=b,a[11]*=b,a;c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1],c=c[2],f=Math.sqrt(e*e+g*g+c*c),h,i,j,k,l,n,o,m,p,r,s,A,B,t,u,v,w,x,y,z;if(!f)return null;f!==1&&(f=1/f,e*=f,g*=f,c*=f);h=Math.sin(b);i=Math.cos(b);j=1-i;b=a[0];f=a[1];k=a[2];l=a[3];n=a[4];o=a[5];m=a[6];p=a[7];r=a[8];s=a[9];A=a[10];B=a[11];t=e*e*j+i;u=g*e*j+c*h;v=c*e*j-g*h;w=e*g*j-c*h;x=g*g*j+i;y=c*g*j+e*h;z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;d?a!==d&&(d[12]=a[12],d[13]=a[13],d[14]=a[14],d[15]=a[15]):d=a;d[0]=b*t+n*u+r*v;d[1]=f*t+o*u+s*v;d[2]=k*t+m*u+A*
v;d[3]=l*t+p*u+B*v;d[4]=b*w+n*x+r*y;d[5]=f*w+o*x+s*y;d[6]=k*w+m*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+n*e+r*g;d[9]=f*z+o*e+s*g;d[10]=k*z+m*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[4]=a[4],c[5]=a[5],c[6]=a[6],c[7]=a[7],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];c?a!==c&&(c[8]=a[8],c[9]=a[9],c[10]=a[10],c[11]=a[11],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b*=a;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e,g,f,h,i,j,k,l,n=a[0],o=a[1],a=a[2];g=c[0];f=c[1];e=c[2];c=b[1];j=b[2];if(n===b[0]&&o===c&&a===j)return mat4.identity(d);c=n-b[0];j=o-b[1];k=a-b[2];l=1/Math.sqrt(c*c+j*j+k*k);c*=l;j*=l;k*=l;b=f*k-e*j;e=e*c-g*k;g=g*j-f*c;(l=Math.sqrt(b*b+e*e+g*g))?(l=1/l,b*=l,e*=l,g*=l):g=e=b=0;f=j*g-k*e;h=k*b-c*g;i=c*e-j*b;(l=Math.sqrt(f*f+h*h+i*i))?(l=1/l,f*=l,h*=l,i*=l):i=h=f=0;d[0]=b;d[1]=f;d[2]=c;d[3]=0;d[4]=e;d[5]=h;d[6]=j;d[7]=0;d[8]=g;d[9]=i;d[10]=k;d[11]=
0;d[12]=-(b*n+e*o+g*a);d[13]=-(f*n+h*o+i*a);d[14]=-(c*n+j*o+k*a);d[15]=1;return d};mat4.fromRotationTranslation=function(a,b,c){c||(c=mat4.create());var d=a[0],e=a[1],g=a[2],f=a[3],h=d+d,i=e+e,j=g+g,a=d*h,k=d*i;d*=j;var l=e*i;e*=j;g*=j;h*=f;i*=f;f*=j;c[0]=1-(l+g);c[1]=k+f;c[2]=d-i;c[3]=0;c[4]=k-f;c[5]=1-(a+g);c[6]=e+h;c[7]=0;c[8]=d+i;c[9]=e-h;c[10]=1-(a+l);c[11]=0;c[12]=b[0];c[13]=b[1];c[14]=b[2];c[15]=1;return c};
mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4.create=function(a){var b=new MatrixArray(4);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3]);return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a===b)return a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e)),a;b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a===b)return a[0]*=-1,a[1]*=-1,a[2]*=-1,a;b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2],a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f===0)return b[0]=0,b[1]=0,b[2]=0,b[3]=0,b;f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],a=a[3],f=b[0],h=b[1],i=b[2],b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=a[0],f=a[1],h=a[2],a=a[3],i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d,d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=k-g;b[4]=1-(j+e);b[5]=d+f;b[6]=c+h;b[7]=d-f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=0;b[4]=k-g;b[5]=1-(j+e);b[6]=d+f;b[7]=0;b[8]=c+h;b[9]=d-f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
quat4.slerp=function(a,b,c,d){d||(d=a);var e=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],g,f;if(Math.abs(e)>=1)return d!==a&&(d[0]=a[0],d[1]=a[1],d[2]=a[2],d[3]=a[3]),d;g=Math.acos(e);f=Math.sqrt(1-e*e);if(Math.abs(f)<0.001)return d[0]=a[0]*0.5+b[0]*0.5,d[1]=a[1]*0.5+b[1]*0.5,d[2]=a[2]*0.5+b[2]*0.5,d[3]=a[3]*0.5+b[3]*0.5,d;e=Math.sin((1-c)*g)/f;c=Math.sin(c*g)/f;d[0]=a[0]*e+b[0]*c;d[1]=a[1]*e+b[1]*c;d[2]=a[2]*e+b[2]*c;d[3]=a[3]*e+b[3]*c;return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
(function()
{
    var MAX_VERTICES = 8000;                        // equates to 2500 objects being drawn
    var MAX_INDICES = (MAX_VERTICES / 2) * 3;       // 6 indices for every 4 vertices
    var MAX_POINTS = 8000;
    var MULTI_BUFFERS = 4;                          // cycle 4 buffers to try and avoid blocking
    var BATCH_NULL = 0;
    var BATCH_QUAD = 1;
    var BATCH_SETTEXTURE = 2;
    var BATCH_SETOPACITY = 3;
    var BATCH_SETBLEND = 4;
    var BATCH_UPDATEMODELVIEW = 5;
    var BATCH_RENDERTOTEXTURE = 6;
    var BATCH_CLEAR = 7;
    var BATCH_POINTS = 8;
    var BATCH_SETPROGRAM = 9;
    var BATCH_SETPROGRAMPARAMETERS = 10;
    function GLWrap_(gl, isMobile)
    {
        this.width = 0;     // not yet known, wait for call to setSize()
        this.height = 0;
        this.cam = vec3.create([0, 0, 100]);            // camera position
        this.look = vec3.create([0, 0, 0]);             // lookat position
        this.up = vec3.create([0, 1, 0]);               // up vector
        this.worldScale = vec3.create([1, 1, 1]);       // world scaling factor
        this.matP = mat4.create();                      // perspective matrix
        this.matMV = mat4.create();                     // model view matrix
        this.lastMV = mat4.create();
        this.currentMV = mat4.create();
        this.gl = gl;
        this.initState();
    };
    GLWrap_.prototype.initState = function ()
    {
        var gl = this.gl;
        var i, len;
        this.lastOpacity = 1;
        this.lastTexture = null;
        this.currentOpacity = 1;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.lastSrcBlend = gl.ONE;
        this.lastDestBlend = gl.ONE_MINUS_SRC_ALPHA;
        this.pointBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
        this.vertexBuffers = new Array(MULTI_BUFFERS);
        this.texcoordBuffers = new Array(MULTI_BUFFERS);
        for (i = 0; i < MULTI_BUFFERS; i++)
        {
            this.vertexBuffers[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[i]);
            this.texcoordBuffers[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[i]);
        }
        this.curBuffer = 0;
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.vertexData = new Float32Array(MAX_VERTICES * 2);
        this.texcoordData = new Float32Array(MAX_VERTICES * 2);
        this.pointData = new Float32Array(MAX_POINTS * 4);
        var indexData = new Uint16Array(MAX_INDICES);
        i = 0, len = MAX_INDICES;
        var fv = 0;
        while (i < len)
        {
            indexData[i++] = fv;        // top left
            indexData[i++] = fv + 1;    // top right
            indexData[i++] = fv + 2;    // bottom right (first tri)
            indexData[i++] = fv;        // top left
            indexData[i++] = fv + 2;    // bottom right
            indexData[i++] = fv + 3;    // bottom left
            fv += 4;
        }
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
        this.vertexPtr = 0;
        this.pointPtr = 0;
        var fsSource, vsSource;
        this.shaderPrograms = [];
        fsSource = [
            "varying mediump vec2 vTex;",
            "uniform lowp float opacity;",
            "uniform lowp sampler2D samplerFront;",
            "void main(void) {",
            "   gl_FragColor = texture2D(samplerFront, vTex);",
            "   gl_FragColor *= opacity;",
            "}"
        ].join("\n");
        vsSource = [
            "attribute highp vec2 aPos;",
            "attribute mediump vec2 aTex;",
            "varying mediump vec2 vTex;",
            "uniform highp mat4 matP;",
            "uniform highp mat4 matMV;",
            "void main(void) {",
            "   gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
            "   vTex = aTex;",
            "}"
        ].join("\n");
        var shaderProg = this.createShaderProgram({src: fsSource}, vsSource, "<default>");
;
        this.shaderPrograms.push(shaderProg);       // Default shader is always shader 0
        fsSource = [
            "uniform mediump sampler2D samplerFront;",
            "varying lowp float opacity;",
            "void main(void) {",
            "   gl_FragColor = texture2D(samplerFront, gl_PointCoord);",
            "   gl_FragColor *= opacity;",
            "}"
        ].join("\n");
        var pointVsSource = [
            "attribute vec4 aPos;",
            "varying float opacity;",
            "uniform mat4 matP;",
            "uniform mat4 matMV;",
            "void main(void) {",
            "   gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
            "   gl_PointSize = aPos.z;",
            "   opacity = aPos.w;",
            "}"
        ].join("\n");
        shaderProg = this.createShaderProgram({src: fsSource}, pointVsSource, "<point>");
;
        this.shaderPrograms.push(shaderProg);       // Point shader is always shader 1
        for (var shader_name in cr.shaders)
        {
            if (cr.shaders.hasOwnProperty(shader_name))
                this.shaderPrograms.push(this.createShaderProgram(cr.shaders[shader_name], vsSource, shader_name));
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.batch = [];
        this.batchPtr = 0;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
        this.lastProgram = -1;              // start -1 so first switchProgram can do work
        this.currentProgram = -1;           // current program during batch execution
        this.currentShader = null;
        this.fbo = gl.createFramebuffer();
        this.renderToTex = null;
        this.tmpVec3 = vec3.create([0, 0, 0]);
;
;
        var pointsizes = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
        this.minPointSize = pointsizes[0];
        this.maxPointSize = pointsizes[1];
;
        this.switchProgram(0);
        cr.seal(this);
    };
    function GLShaderProgram(gl, shaderProgram, name)
    {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.name = name;
        this.locAPos = gl.getAttribLocation(shaderProgram, "aPos");
        this.locATex = gl.getAttribLocation(shaderProgram, "aTex");
        this.locMatP = gl.getUniformLocation(shaderProgram, "matP");
        this.locMatMV = gl.getUniformLocation(shaderProgram, "matMV");
        this.locOpacity = gl.getUniformLocation(shaderProgram, "opacity");
        this.locSamplerFront = gl.getUniformLocation(shaderProgram, "samplerFront");
        this.locSamplerBack = gl.getUniformLocation(shaderProgram, "samplerBack");
        this.locDestStart = gl.getUniformLocation(shaderProgram, "destStart");
        this.locDestEnd = gl.getUniformLocation(shaderProgram, "destEnd");
        this.locSeconds = gl.getUniformLocation(shaderProgram, "seconds");
        this.locPixelWidth = gl.getUniformLocation(shaderProgram, "pixelWidth");
        this.locPixelHeight = gl.getUniformLocation(shaderProgram, "pixelHeight");
        this.locLayerScale = gl.getUniformLocation(shaderProgram, "layerScale");
        if (this.locOpacity)
            gl.uniform1f(this.locOpacity, 1);
        if (this.locSamplerFront)
            gl.uniform1i(this.locSamplerFront, 0);
        if (this.locSamplerBack)
            gl.uniform1i(this.locSamplerBack, 1);
        if (this.locDestStart)
            gl.uniform2f(this.locDestStart, 0.0, 0.0);
        if (this.locDestEnd)
            gl.uniform2f(this.locDestEnd, 1.0, 1.0);
        this.hasCurrentMatMV = false;       // matMV needs updating
    };
    GLWrap_.prototype.createShaderProgram = function(shaderEntry, vsSource, name)
    {
        var gl = this.gl;
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaderEntry.src);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
        {
;
            gl.deleteShader(fragmentShader);
            return null;
        }
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vsSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
        {
;
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, fragmentShader);
        gl.attachShader(shaderProgram, vertexShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        {
;
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            gl.deleteProgram(shaderProgram);
            return null;
        }
        gl.useProgram(shaderProgram);
        gl.validateProgram(shaderProgram);
;
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        var ret = new GLShaderProgram(gl, shaderProgram, name);
        ret.extendBoxHorizontal = shaderEntry.extendBoxHorizontal || 0;
        ret.extendBoxVertical = shaderEntry.extendBoxVertical || 0;
        ret.crossSampling = !!shaderEntry.crossSampling;
        ret.animated = !!shaderEntry.animated;
        ret.parameters = shaderEntry.parameters || [];
        var i, len;
        for (i = 0, len = ret.parameters.length; i < len; i++)
        {
            ret.parameters[i][1] = gl.getUniformLocation(shaderProgram, ret.parameters[i][0]);
            gl.uniform1f(ret.parameters[i][1], 0);
        }
        cr.seal(ret);
        return ret;
    };
    GLWrap_.prototype.getShaderIndex = function(name_)
    {
        var i, len;
        for (i = 0, len = this.shaderPrograms.length; i < len; i++)
        {
            if (this.shaderPrograms[i].name === name_)
                return i;
        }
        return -1;
    };
    GLWrap_.prototype.project = function (x, y, out)
    {
        var viewport = [0, 0, this.width, this.height];
        var mv = this.matMV;
        var proj = this.matP;
        var fTempo = [0, 0, 0, 0, 0, 0, 0, 0];
        fTempo[0] = mv[0]*x+mv[4]*y+mv[12];
        fTempo[1] = mv[1]*x+mv[5]*y+mv[13];
        fTempo[2] = mv[2]*x+mv[6]*y+mv[14];
        fTempo[3] = mv[3]*x+mv[7]*y+mv[15];
        fTempo[4] = proj[0]*fTempo[0]+proj[4]*fTempo[1]+proj[8]*fTempo[2]+proj[12]*fTempo[3];
        fTempo[5] = proj[1]*fTempo[0]+proj[5]*fTempo[1]+proj[9]*fTempo[2]+proj[13]*fTempo[3];
        fTempo[6] = proj[2]*fTempo[0]+proj[6]*fTempo[1]+proj[10]*fTempo[2]+proj[14]*fTempo[3];
        fTempo[7] = -fTempo[2];
        if(fTempo[7]===0.0) //The w value
            return;
        fTempo[7]=1.0/fTempo[7];
        fTempo[4]*=fTempo[7];
        fTempo[5]*=fTempo[7];
        fTempo[6]*=fTempo[7];
        out[0]=(fTempo[4]*0.5+0.5)*viewport[2]+viewport[0];
        out[1]=(fTempo[5]*0.5+0.5)*viewport[3]+viewport[1];
    };
    GLWrap_.prototype.setSize = function(w, h, force)
    {
        if (this.width === w && this.height === h && !force)
            return;
        this.endBatch();
        this.width = w;
        this.height = h;
        this.gl.viewport(0, 0, w, h);
        mat4.perspective(45, w / h, 1, 1000, this.matP);
        mat4.lookAt(this.cam, this.look, this.up, this.matMV);
        var tl = [0, 0];
        var br = [0, 0];
        this.project(0, 0, tl);
        this.project(1, 1, br);
        this.worldScale[0] = 1 / (br[0] - tl[0]);
        this.worldScale[1] = -1 / (br[1] - tl[1]);
        var i, len, s;
        for (i = 0, len = this.shaderPrograms.length; i < len; i++)
        {
            s = this.shaderPrograms[i];
            s.hasCurrentMatMV = false;
            if (s.locMatP)
            {
                this.gl.useProgram(s.shaderProgram);
                this.gl.uniformMatrix4fv(s.locMatP, false, this.matP);
            }
        }
        this.gl.useProgram(this.shaderPrograms[this.lastProgram].shaderProgram);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.lastTexture = null;
    };
    GLWrap_.prototype.resetModelView = function ()
    {
        mat4.lookAt(this.cam, this.look, this.up, this.matMV);
        mat4.scale(this.matMV, this.worldScale);
    };
    GLWrap_.prototype.translate = function (x, y)
    {
        if (x === 0 && y === 0)
            return;
        this.tmpVec3[0] = x;// * this.worldScale[0];
        this.tmpVec3[1] = y;// * this.worldScale[1];
        this.tmpVec3[2] = 0;
        mat4.translate(this.matMV, this.tmpVec3);
    };
    GLWrap_.prototype.scale = function (x, y)
    {
        if (x === 1 && y === 1)
            return;
        this.tmpVec3[0] = x;
        this.tmpVec3[1] = y;
        this.tmpVec3[2] = 1;
        mat4.scale(this.matMV, this.tmpVec3);
    };
    GLWrap_.prototype.rotateZ = function (a)
    {
        if (a === 0)
            return;
        mat4.rotateZ(this.matMV, a);
    };
    GLWrap_.prototype.updateModelView = function()
    {
        var anydiff = false;
        for (var i = 0; i < 16; i++)
        {
            if (this.lastMV[i] !== this.matMV[i])
            {
                anydiff = true;
                break;
            }
        }
        if (!anydiff)
            return;
        var b = this.pushBatch();
        b.type = BATCH_UPDATEMODELVIEW;
        if (b.mat4param)
            mat4.set(this.matMV, b.mat4param);
        else
            b.mat4param = mat4.create(this.matMV);
        mat4.set(this.matMV, this.lastMV);
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    /*
    var debugBatch = false;
    jQuery(document).mousedown(
        function(info) {
            if (info.which === 2)
                debugBatch = true;
        }
    );
    */
    function GLBatchJob(type_, glwrap_)
    {
        this.type = type_;
        this.glwrap = glwrap_;
        this.gl = glwrap_.gl;
        this.opacityParam = 0;      // for setOpacity()
        this.startIndex = 0;        // for quad()
        this.indexCount = 0;        // "
        this.texParam = null;       // for setTexture()
        this.mat4param = null;      // for updateModelView()
        this.shaderParams = [];     // for user parameters
        cr.seal(this);
    };
    GLBatchJob.prototype.doSetTexture = function ()
    {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texParam);
    };
    GLBatchJob.prototype.doSetOpacity = function ()
    {
        var o = this.opacityParam;
        var glwrap = this.glwrap;
        glwrap.currentOpacity = o;
        var curProg = glwrap.currentShader;
        if (curProg.locOpacity)
            this.gl.uniform1f(curProg.locOpacity, o);
    };
    GLBatchJob.prototype.doQuad = function ()
    {
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, this.startIndex * 2);
    };
    GLBatchJob.prototype.doSetBlend = function ()
    {
        this.gl.blendFunc(this.startIndex, this.indexCount);
    };
    GLBatchJob.prototype.doUpdateModelView = function ()
    {
        var i, len, s, shaderPrograms = this.glwrap.shaderPrograms, currentProgram = this.glwrap.currentProgram;
        for (i = 0, len = shaderPrograms.length; i < len; i++)
        {
            s = shaderPrograms[i];
            if (i === currentProgram && s.locMatMV)
            {
                this.gl.uniformMatrix4fv(s.locMatMV, false, this.mat4param);
                s.hasCurrentMatMV = true;
            }
            else
                s.hasCurrentMatMV = false;
        }
        mat4.set(this.mat4param, this.glwrap.currentMV);
    };
    GLBatchJob.prototype.doRenderToTexture = function ()
    {
        var gl = this.gl;
        var glwrap = this.glwrap;
        if (this.texParam)
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texParam, 0);
;
        }
        else
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    };
    GLBatchJob.prototype.doClear = function ()
    {
        var gl = this.gl;
        if (this.startIndex === 0)      // clear whole surface
        {
            gl.clearColor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        else                            // clear rectangle
        {
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(this.gl.COLOR_BUFFER_BIT);
            gl.disable(gl.SCISSOR_TEST);
        }
    };
    GLBatchJob.prototype.doPoints = function ()
    {
        var gl = this.gl;
        var glwrap = this.glwrap;
        var s = glwrap.shaderPrograms[1];
        gl.useProgram(s.shaderProgram);
        if (!s.hasCurrentMatMV && s.locMatMV)
        {
            gl.uniformMatrix4fv(s.locMatMV, false, glwrap.currentMV);
            s.hasCurrentMatMV = true;
        }
        gl.enableVertexAttribArray(s.locAPos);
        gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.pointBuffer);
        gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, this.startIndex / 4, this.indexCount);
        s = glwrap.currentShader;
        gl.useProgram(s.shaderProgram);
        if (s.locAPos >= 0)
        {
            gl.enableVertexAttribArray(s.locAPos);
            gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
            gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
        }
        if (s.locATex >= 0)
        {
            gl.enableVertexAttribArray(s.locATex);
            gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
            gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
        }
    };
    GLBatchJob.prototype.doSetProgram = function ()
    {
        var gl = this.gl;
        var glwrap = this.glwrap;
        var s = glwrap.shaderPrograms[this.startIndex];     // recycled param to save memory
        glwrap.currentProgram = this.startIndex;            // current batch program
        glwrap.currentShader = s;
        gl.useProgram(s.shaderProgram);                     // switch to
        if (!s.hasCurrentMatMV && s.locMatMV)
        {
            gl.uniformMatrix4fv(s.locMatMV, false, glwrap.currentMV);
            s.hasCurrentMatMV = true;
        }
        if (s.locOpacity)
            gl.uniform1f(s.locOpacity, glwrap.currentOpacity);
        if (s.locAPos >= 0)
        {
            gl.enableVertexAttribArray(s.locAPos);
            gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
            gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
        }
        if (s.locATex >= 0)
        {
            gl.enableVertexAttribArray(s.locATex);
            gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
            gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
        }
    }
    GLBatchJob.prototype.doSetProgramParameters = function ()
    {
        var i, len, s = this.glwrap.currentShader;
        var gl = this.gl;
        if (s.locSamplerBack)
        {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.texParam);
            gl.activeTexture(gl.TEXTURE0);
        }
        if (s.locPixelWidth)
            gl.uniform1f(s.locPixelWidth, this.mat4param[0]);
        if (s.locPixelHeight)
            gl.uniform1f(s.locPixelHeight, this.mat4param[1]);
        if (s.locDestStart)
            gl.uniform2f(s.locDestStart, this.mat4param[2], this.mat4param[3]);
        if (s.locDestEnd)
            gl.uniform2f(s.locDestEnd, this.mat4param[4], this.mat4param[5]);
        if (s.locLayerScale)
            gl.uniform1f(s.locLayerScale, this.mat4param[6]);
        if (s.locSeconds)
            gl.uniform1f(s.locSeconds, cr.performance_now() / 1000.0);
        if (s.parameters.length)
        {
            for (i = 0, len = s.parameters.length; i < len; i++)
            {
                gl.uniform1f(s.parameters[i][1], this.shaderParams[i]);
            }
        }
    };
    GLWrap_.prototype.pushBatch = function ()
    {
        if (this.batchPtr === this.batch.length)
            this.batch.push(new GLBatchJob(BATCH_NULL, this));
        return this.batch[this.batchPtr++];
    };
    GLWrap_.prototype.endBatch = function ()
    {
        if (this.batchPtr === 0)
            return;
        if (this.gl.isContextLost())
            return;
        var gl = this.gl;
        if (this.pointPtr > 0)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.pointData.subarray(0, this.pointPtr), gl.STREAM_DRAW);
            if (s && s.locAPos >= 0 && s.name === "<point>")
                gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
        }
        if (this.vertexPtr > 0)
        {
            var s = this.currentShader;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[this.curBuffer]);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexPtr), gl.STREAM_DRAW);
            if (s && s.locAPos >= 0 && s.name !== "<point>")
                gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[this.curBuffer]);
            gl.bufferData(gl.ARRAY_BUFFER, this.texcoordData.subarray(0, this.vertexPtr), gl.STREAM_DRAW);
            if (s && s.locATex >= 0 && s.name !== "<point>")
                gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
        }
        var i, len, b;
        for (i = 0, len = this.batchPtr; i < len; i++)
        {
            b = this.batch[i];
            switch (b.type) {
            case BATCH_QUAD:
                b.doQuad();
                break;
            case BATCH_SETTEXTURE:
                b.doSetTexture();
                break;
            case BATCH_SETOPACITY:
                b.doSetOpacity();
                break;
            case BATCH_SETBLEND:
                b.doSetBlend();
                break;
            case BATCH_UPDATEMODELVIEW:
                b.doUpdateModelView();
                break;
            case BATCH_RENDERTOTEXTURE:
                b.doRenderToTexture();
                break;
            case BATCH_CLEAR:
                b.doClear();
                break;
            case BATCH_POINTS:
                b.doPoints();
                break;
            case BATCH_SETPROGRAM:
                b.doSetProgram();
                break;
            case BATCH_SETPROGRAMPARAMETERS:
                b.doSetProgramParameters();
                break;
            }
        }
        this.batchPtr = 0;
        this.vertexPtr = 0;
        this.pointPtr = 0;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
        this.curBuffer++;
        if (this.curBuffer >= MULTI_BUFFERS)
            this.curBuffer = 0;
    };
    GLWrap_.prototype.setOpacity = function (op)
    {
        if (op === this.lastOpacity)
            return;
        var b = this.pushBatch();
        b.type = BATCH_SETOPACITY;
        b.opacityParam = op;
        this.lastOpacity = op;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    GLWrap_.prototype.setTexture = function (tex)
    {
        if (tex === this.lastTexture)
            return;
        var b = this.pushBatch();
        b.type = BATCH_SETTEXTURE;
        b.texParam = tex;
        this.lastTexture = tex;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    GLWrap_.prototype.setBlend = function (s, d)
    {
        if (s === this.lastSrcBlend && d === this.lastDestBlend)
            return;
        var b = this.pushBatch();
        b.type = BATCH_SETBLEND;
        b.startIndex = s;       // recycle params to save memory
        b.indexCount = d;
        this.lastSrcBlend = s;
        this.lastDestBlend = d;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    GLWrap_.prototype.setAlphaBlend = function ()
    {
        this.setBlend(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    };
    var LAST_VERTEX = MAX_VERTICES * 2 - 8;
    GLWrap_.prototype.quad = function(tlx, tly, trx, try_, brx, bry, blx, bly)
    {
        if (this.vertexPtr >= LAST_VERTEX)
            this.endBatch();
        var v = this.vertexPtr;         // vertex cursor
        var vd = this.vertexData;       // vertex data array
        var td = this.texcoordData;     // texture coord data array
        if (this.hasQuadBatchTop)
        {
            this.batch[this.batchPtr - 1].indexCount += 6;
        }
        else
        {
            var b = this.pushBatch();
            b.type = BATCH_QUAD;
            b.startIndex = (v / 4) * 3;
            b.indexCount = 6;
            this.hasQuadBatchTop = true;
            this.hasPointBatchTop = false;
        }
        vd[v] = tlx;
        td[v++] = 0;
        vd[v] = tly;
        td[v++] = 0;
        vd[v] = trx;
        td[v++] = 1;
        vd[v] = try_;
        td[v++] = 0;
        vd[v] = brx;
        td[v++] = 1;
        vd[v] = bry;
        td[v++] = 1;
        vd[v] = blx;
        td[v++] = 0;
        vd[v] = bly;
        td[v++] = 1;
        this.vertexPtr = v;
    };
    GLWrap_.prototype.quadTex = function(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex)
    {
        if (this.vertexPtr >= LAST_VERTEX)
            this.endBatch();
        var v = this.vertexPtr;         // vertex cursor
        var vd = this.vertexData;       // vertex data array
        var td = this.texcoordData;     // texture coord data array
        if (this.hasQuadBatchTop)
        {
            this.batch[this.batchPtr - 1].indexCount += 6;
        }
        else
        {
            var b = this.pushBatch();
            b.type = BATCH_QUAD;
            b.startIndex = (v / 4) * 3;
            b.indexCount = 6;
            this.hasQuadBatchTop = true;
            this.hasPointBatchTop = false;
        }
        vd[v] = tlx;
        td[v++] = rcTex.left;
        vd[v] = tly;
        td[v++] = rcTex.top;
        vd[v] = trx;
        td[v++] = rcTex.right;
        vd[v] = try_;
        td[v++] = rcTex.top;
        vd[v] = brx;
        td[v++] = rcTex.right;
        vd[v] = bry;
        td[v++] = rcTex.bottom;
        vd[v] = blx;
        td[v++] = rcTex.left;
        vd[v] = bly;
        td[v++] = rcTex.bottom;
        this.vertexPtr = v;
    };
    var LAST_POINT = MAX_POINTS - 4;
    GLWrap_.prototype.point = function(x_, y_, size_, opacity_)
    {
        if (this.pointPtr >= LAST_POINT)
            this.endBatch();
        var p = this.pointPtr;          // point cursor
        var pd = this.pointData;        // point data array
        if (this.hasPointBatchTop)
        {
            this.batch[this.batchPtr - 1].indexCount++;
        }
        else
        {
            var b = this.pushBatch();
            b.type = BATCH_POINTS;
            b.startIndex = p;
            b.indexCount = 1;
            this.hasPointBatchTop = true;
            this.hasQuadBatchTop = false;
        }
        pd[p++] = x_;
        pd[p++] = y_;
        pd[p++] = size_;
        pd[p++] = opacity_;
        this.pointPtr = p;
    };
    GLWrap_.prototype.switchProgram = function (progIndex)
    {
        if (this.lastProgram === progIndex)
            return;         // no change
        var shaderProg = this.shaderPrograms[progIndex];
        if (!shaderProg)
        {
            if (this.lastProgram === 0)
                return;                             // already on default shader
            progIndex = 0;
            shaderProg = this.shaderPrograms[0];
        }
        var b = this.pushBatch();
        b.type = BATCH_SETPROGRAM;
        b.startIndex = progIndex;
        this.lastProgram = progIndex;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    GLWrap_.prototype.programUsesDest = function (progIndex)
    {
        var s = this.shaderPrograms[progIndex];
        return !!(s.locDestStart || s.locDestEnd);
    };
    GLWrap_.prototype.programUsesCrossSampling = function (progIndex)
    {
        return this.shaderPrograms[progIndex].crossSampling;
    };
    GLWrap_.prototype.programExtendsBox = function (progIndex)
    {
        var s = this.shaderPrograms[progIndex];
        return s.extendBoxHorizontal !== 0 || s.extendBoxVertical !== 0;
    };
    GLWrap_.prototype.getProgramBoxExtendHorizontal = function (progIndex)
    {
        return this.shaderPrograms[progIndex].extendBoxHorizontal;
    };
    GLWrap_.prototype.getProgramBoxExtendVertical = function (progIndex)
    {
        return this.shaderPrograms[progIndex].extendBoxVertical;
    };
    GLWrap_.prototype.getProgramParameterType = function (progIndex, paramIndex)
    {
        return this.shaderPrograms[progIndex].parameters[paramIndex][2];
    };
    GLWrap_.prototype.programIsAnimated = function (progIndex)
    {
        return this.shaderPrograms[progIndex].animated;
    };
    GLWrap_.prototype.setProgramParameters = function (backTex, pixelWidth, pixelHeight, destStartX, destStartY, destEndX, destEndY, layerScale, params)
    {
        var i, len, s = this.shaderPrograms[this.lastProgram];
        if (s.locPixelWidth || s.locPixelHeight || s.locSeconds || s.locSamplerBack ||
            s.locDestStart || s.locDestEnd || s.locLayerScale || params.length)
        {
            var b = this.pushBatch();
            b.type = BATCH_SETPROGRAMPARAMETERS;
            if (b.mat4param)
                mat4.set(this.matMV, b.mat4param);
            else
                b.mat4param = mat4.create();
            b.mat4param[0] = pixelWidth;
            b.mat4param[1] = pixelHeight;
            b.mat4param[2] = destStartX;
            b.mat4param[3] = destStartY;
            b.mat4param[4] = destEndX;
            b.mat4param[5] = destEndY;
            b.mat4param[6] = layerScale;
            b.texParam = backTex;
            if (params.length)
            {
                b.shaderParams.length = params.length;
                for (i = 0, len = params.length; i < len; i++)
                    b.shaderParams[i] = params[i];
            }
            this.hasQuadBatchTop = false;
            this.hasPointBatchTop = false;
        }
    };
    GLWrap_.prototype.clear = function (r, g, b_, a)
    {
        var b = this.pushBatch();
        b.type = BATCH_CLEAR;
        b.startIndex = 0;                   // clear all mode
        if (!b.mat4param)
            b.mat4param = mat4.create();
        b.mat4param[0] = r;
        b.mat4param[1] = g;
        b.mat4param[2] = b_;
        b.mat4param[3] = a;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    GLWrap_.prototype.clearRect = function (x, y, w, h)
    {
        var b = this.pushBatch();
        b.type = BATCH_CLEAR;
        b.startIndex = 1;                   // clear rect mode
        if (!b.mat4param)
            b.mat4param = mat4.create();
        b.mat4param[0] = x;
        b.mat4param[1] = y;
        b.mat4param[2] = w;
        b.mat4param[3] = h;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    GLWrap_.prototype.present = function ()
    {
        this.endBatch();
        this.gl.flush();
        /*
        if (debugBatch)
        {
;
            debugBatch = false;
        }
        */
    };
    function nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }
    var all_textures = [];
    GLWrap_.prototype.loadTexture = function (img, tiling, linearsampling)
    {
        this.endBatch();
;
        var gl = this.gl;
        var isPOT = (cr.isPOT(img.width) && cr.isPOT(img.height));
        var webGL_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
        gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
        if (!isPOT && tiling)
        {
            var canvas = document.createElement("canvas");
            canvas.width = nextHighestPowerOfTwo(img.width);
            canvas.height = nextHighestPowerOfTwo(img.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img,
                          0, 0, img.width, img.height,
                          0, 0, canvas.width, canvas.height);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        }
        else
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, tiling ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, tiling ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        if (linearsampling)
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            if (isPOT)
            {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        else
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.lastTexture = null;
        webGL_texture.c2width = img.width;
        webGL_texture.c2height = img.height;
        all_textures.push(webGL_texture);
        return webGL_texture;
    };
    GLWrap_.prototype.createEmptyTexture = function (w, h, linearsampling)
    {
        this.endBatch();
        var gl = this.gl;
        var webGL_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(w * h * 4));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.lastTexture = null;
        webGL_texture.c2width = w;
        webGL_texture.c2height = h;
        all_textures.push(webGL_texture);
        return webGL_texture;
    };
    GLWrap_.prototype.videoToTexture = function (video_, texture_)
    {
        this.endBatch();
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture_);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video_);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.lastTexture = null;
    };
    GLWrap_.prototype.deleteTexture = function (tex)
    {
        this.endBatch();
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.lastTexture = null;
        this.gl.deleteTexture(tex);
        cr.arrayFindRemove(all_textures, tex);
    };
    GLWrap_.prototype.estimateVRAM = function ()
    {
        var total = 0;
        var i, len, t;
        for (i = 0, len = all_textures.length; i < len; i++)
        {
            t = all_textures[i];
            total += (t.c2width * t.c2height * 4);
        }
        return total;
    };
    GLWrap_.prototype.textureCount = function ()
    {
        return all_textures.length;
    };
    GLWrap_.prototype.setRenderingToTexture = function (tex)
    {
        if (tex === this.renderToTex)
            return;
        var b = this.pushBatch();
        b.type = BATCH_RENDERTOTEXTURE;
        b.texParam = tex;
        this.renderToTex = tex;
        this.hasQuadBatchTop = false;
        this.hasPointBatchTop = false;
    };
    cr.GLWrap = GLWrap_;
}());
;
(function()
{
    function Runtime(canvas)
    {
        if (!canvas || (!canvas.getContext && !canvas["dc"]))
            return;
        if (canvas["c2runtime"])
            return;
        else
            canvas["c2runtime"] = this;
        var self = this;
        this.isPhoneGap = (typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined"));
        this.isDirectCanvas = !!canvas["dc"];
        this.isAppMobi = (typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas);
        this.isCocoonJs = !!window["c2cocoonjs"];
        if (this.isCocoonJs)
        {
            ext["IDTK_APP"].addEventListener("onsuspended", function() {
                self.setSuspended(true);
            });
            ext["IDTK_APP"].addEventListener("onactivated", function () {
                self.setSuspended(false);
            });
        }
        this.isDomFree = this.isDirectCanvas || this.isCocoonJs;
        this.isAndroid = /android/i.test(navigator.userAgent);
        this.isIE = /msie/i.test(navigator.userAgent);
        this.isiPhone = /iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent);   // treat ipod as an iphone
        this.isiPad = /ipad/i.test(navigator.userAgent);
        this.isiOS = this.isiPhone || this.isiPad;
        this.isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
        this.isSafari = !this.isChrome && /safari/i.test(navigator.userAgent);      // Chrome includes Safari in UA
        this.isWindows = /windows/i.test(navigator.userAgent);
        this.isAwesomium = /awesomium/i.test(navigator.userAgent);
        this.isArcade = (typeof window["is_scirra_arcade"] !== "undefined");
        this.devicePixelRatio = 1;
        this.isMobile = (this.isPhoneGap || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS);
        if (!this.isMobile)
            this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet)/i.test(navigator.userAgent);
        this.canvas = canvas;
        this.canvasdiv = document.getElementById("c2canvasdiv");
        this.gl = null;
        this.glwrap = null;
        this.ctx = null;
        this.canvas.oncontextmenu = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
        this.canvas.onselectstart = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
        if (this.isDirectCanvas)
            window["c2runtime"] = this;
        this.width = canvas.width;
        this.height = canvas.height;
        this.lastwidth = this.width;
        this.lastheight = this.height;
        this.redraw = true;
        this.isSuspended = false;
        if (!Date.now) {
          Date.now = function now() {
            return +new Date();
          };
        }
        this.plugins = [];
        this.types = {};
        this.types_by_index = [];
        this.behaviors = [];
        this.layouts = {};
        this.layouts_by_index = [];
        this.eventsheets = {};
        this.eventsheets_by_index = [];
        this.wait_for_textures = [];        // for blocking until textures loaded
        this.triggers_to_postinit = [];
        this.all_global_vars = [];
        this.deathRow = new cr.ObjectSet();
        this.isInClearDeathRow = false;
        this.isInOnDestroy = 0;                 // needs to support recursion so increments and decrements and is true if > 0
        this.isRunningEvents = false;
        this.createRow = [];
        this.dt = 0;
        this.dt1 = 0;
        this.logictime = 0;         // used to calculate CPUUtilisation
        this.cpuutilisation = 0;
        this.zeroDtCount = 0;
        this.timescale = 1.0;
        this.kahanTime = new cr.KahanAdder();
        this.last_tick_time = 0;
        this.measuring_dt = true;
        this.fps = 0;
        this.last_fps_time = 0;
        this.tickcount = 0;
        this.execcount = 0;
        this.framecount = 0;        // for fps
        this.objectcount = 0;
        this.changelayout = null;
        this.destroycallbacks = [];
        this.event_stack = [];
        this.event_stack_index = -1;
        this.pushEventStack(null);
        this.loop_stack = [];
        this.loop_stack_index = -1;
        this.next_uid = 0;
        this.layout_first_tick = true;
        this.family_count = 0;
        this.suspend_events = [];
        this.raf_id = 0;
        this.timeout_id = 0;
        this.isloading = true;
        this.loadingprogress = 0;
        this.isAwesomiumFullscreen = false;
        this.objects_to_tick = new cr.ObjectSet();
        this.objects_to_tick2 = new cr.ObjectSet();
        this.registered_collisions = [];
        this.temp_poly = new cr.CollisionPoly([]);
        this.allGroups = [];                // array of all event groups
        this.activeGroups = {};             // event group activation states
        this.running_layout = null;         // currently running layout
        this.layer_canvas = null;           // for layers "render-to-texture"
        this.layer_ctx = null;
        this.layer_tex = null;
        this.layout_tex = null;
        this.is_WebGL_context_lost = false;
        this.uses_background_blending = false;  // if any shader uses background blending, so entire layout renders to texture
        this.fx_tex = [null, null];
        this.fullscreen_scaling = 0;
        this.files_subfolder = "";          // path with project files
        this.loaderlogo = null;
        this.snapshotCanvas = null;
        this.snapshotData = "";
        this.load();
        var isiOSRetina = (!this.isDomFree && this.useiOSRetina && this.isiOS);
        this.devicePixelRatio = (isiOSRetina ? (window["devicePixelRatio"] || 1) : 1);
        this.ClearDeathRow();
        var attribs;
        try {
            if (this.enableWebGL && !this.isDomFree)
            {
                attribs = { "depth": false, "antialias": !this.isMobile };
                var use_webgl = true;
                if (this.isChrome && this.isWindows)
                {
                    var tempcanvas = document.createElement("canvas");
                    var tempgl = (tempcanvas.getContext("webgl", attribs) || tempcanvas.getContext("experimental-webgl", attribs));
                    if (tempgl.getSupportedExtensions().toString() === "OES_texture_float,OES_standard_derivatives,WEBKIT_WEBGL_lose_context")
                    {
;
                        use_webgl = false;
                    }
                }
                if (use_webgl)
                    this.gl = (canvas.getContext("webgl", attribs) || canvas.getContext("experimental-webgl", attribs));
            }
        }
        catch (e) {
        }
        if (this.gl)
        {
;
            this.overlay_canvas = document.createElement("canvas");
            jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);
            this.overlay_canvas.oncontextmenu = function (e) { return false; };
            this.overlay_canvas.onselectstart = function (e) { return false; };
            this.overlay_canvas.width = canvas.width;
            this.overlay_canvas.height = canvas.height;
            this.positionOverlayCanvas();
            this.overlay_ctx = this.overlay_canvas.getContext("2d");
            this.glwrap = new cr.GLWrap(this.gl, this.isMobile);
            this.glwrap.setSize(canvas.width, canvas.height);
            this.ctx = null;
            this.canvas.addEventListener("webglcontextlost", function (ev) {
                console.log("WebGL context lost");
                ev.preventDefault();
                self.onContextLost();
                window["cr_setSuspended"](true);        // stop rendering
            }, false);
            this.canvas.addEventListener("webglcontextrestored", function (ev) {
                console.log("WebGL context restored");
                self.glwrap.initState();
                self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
                self.layer_tex = null;
                self.layout_tex = null;
                self.fx_tex[0] = null;
                self.fx_tex[1] = null;
                self.onContextRestored();
                self.redraw = true;
                window["cr_setSuspended"](false);       // resume rendering
            }, false);
            var i, len, j, lenj, k, lenk, t, s, l, y;
            for (i = 0, len = this.types_by_index.length; i < len; i++)
            {
                t = this.types_by_index[i];
                for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
                {
                    s = t.effect_types[j];
                    s.shaderindex = this.glwrap.getShaderIndex(s.id);
                    this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
                }
            }
            for (i = 0, len = this.layouts_by_index.length; i < len; i++)
            {
                l = this.layouts_by_index[i];
                for (j = 0, lenj = l.effect_types.length; j < lenj; j++)
                {
                    s = l.effect_types[j];
                    s.shaderindex = this.glwrap.getShaderIndex(s.id);
                }
                for (j = 0, lenj = l.layers.length; j < lenj; j++)
                {
                    y = l.layers[j];
                    for (k = 0, lenk = y.effect_types.length; k < lenk; k++)
                    {
                        s = y.effect_types[k];
                        s.shaderindex = this.glwrap.getShaderIndex(s.id);
                        this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
                    }
                }
            }
        }
        else
        {
            if (this.fullscreen_mode > 0 && this.isDirectCanvas)
            {
;
                this.canvas = null;
                document.oncontextmenu = function (e) { return false; };
                document.onselectstart = function (e) { return false; };
                this.ctx = AppMobi["canvas"]["getContext"]("2d");
                try {
                    this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
                    this.ctx["globalScale"] = 1;
                    this.ctx["HTML5CompatibilityMode"] = true;
                } catch(e){}
                if (this.width !== 0 && this.height !== 0)
                {
                    this.ctx.width = this.width;
                    this.ctx.height = this.height;
                }
            }
            if (!this.ctx)
            {
;
                if (this.isCocoonJs)
                {
                    attribs = { "antialias" : !!this.linearSampling };
                    this.ctx = canvas.getContext("2d", attribs);
                }
                else
                    this.ctx = canvas.getContext("2d");
                this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
                this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
                this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
                this.ctx["imageSmoothingEnabled"] = this.linearSampling;
            }
            this.overlay_canvas = null;
            this.overlay_ctx = null;
        }
        this.tickFunc = (function (self) { return function () { self.tick(); }; })(this);
        this.go();          // run loading screen
        this.extra = {};
        cr.seal(this);
    };
    var webkitRepaintFlag = false;
    Runtime.prototype["setSize"] = function (w, h)
    {
        var tryHideAddressBar = this.hideAddressBar && (this.isiPhone || this.isAndroid) && !navigator["standalone"] && !this.isDomFree && !this.isPhoneGap;
        var addressBarHeight = 0;
        if (tryHideAddressBar)
        {
            if (this.isiPhone)
                addressBarHeight = 60;
            else if (this.isAndroid)
                addressBarHeight = 56;
            h += addressBarHeight;
        }
        var offx = 0, offy = 0;
        var neww = 0, newh = 0, intscale = 0;
        var mode = this.fullscreen_mode;
        var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
        if (isfullscreen && this.fullscreen_scaling > 0)
            mode = this.fullscreen_scaling;
        if (mode >= 3)
        {
            var orig_aspect = this.original_width / this.original_height;
            var cur_aspect = w / h;
            if (cur_aspect > orig_aspect)
            {
                neww = h * orig_aspect;
                if (mode === 4) // integer scaling
                {
                    intscale = neww / this.original_width;
                    if (intscale > 1)
                        intscale = Math.floor(intscale);
                    else if (intscale < 1)
                        intscale = 1 / Math.ceil(1 / intscale);
                    neww = this.original_width * intscale;
                    newh = this.original_height * intscale;
                    offx = (w - neww) / 2;
                    offy = (h - newh) / 2;
                    w = neww;
                    h = newh;
                }
                else
                {
                    offx = (w - neww) / 2;
                    w = neww;
                }
            }
            else
            {
                newh = w / orig_aspect;
                if (mode === 4) // integer scaling
                {
                    intscale = newh / this.original_height;
                    if (intscale > 1)
                        intscale = Math.floor(intscale);
                    else if (intscale < 1)
                        intscale = 1 / Math.ceil(1 / intscale);
                    neww = this.original_width * intscale;
                    newh = this.original_height * intscale;
                    offx = (w - neww) / 2;
                    offy = (h - newh) / 2;
                    w = neww;
                    h = newh;
                }
                else
                {
                    offy = (h - newh) / 2;
                    h = newh;
                }
            }
            if (isfullscreen && !this.isAwesomium)
            {
                offx = 0;
                offy = 0;
            }
            offx = Math.floor(offx);
            offy = Math.floor(offy);
            w = Math.floor(w);
            h = Math.floor(h);
        }
        else if (this.isAwesomium && this.isAwesomiumFullscreen && this.fullscreen_mode_set === 0)
        {
            offx = Math.floor((w - this.original_width) / 2);
            offy = Math.floor((h - this.original_height) / 2);
            w = this.original_width;
            h = this.original_height;
        }
        var isiOSRetina = (!this.isDomFree && this.useiOSRetina && this.isiOS);
        if (isiOSRetina && this.isiPad && this.devicePixelRatio > 1)    // don't apply to iPad 1-2
        {
            if (w >= 1024)
                w = 1023;       // 2046 retina pixels
            if (h >= 1024)
                h = 1023;
        }
        var multiplier = this.devicePixelRatio;
        this.width = w * multiplier;
        this.height = h * multiplier;
        this.redraw = true;
        if (this.canvasdiv && !this.isDomFree)
        {
            jQuery(this.canvasdiv).css({"width": w + "px",
                                        "height": h + "px",
                                        "margin-left": offx,
                                        "margin-top": offy});
            if (typeof cr_is_preview !== "undefined")
            {
                jQuery("#borderwrap").css({"width": w + "px",
                                            "height": h + "px"});
            }
        }
        if (this.canvas)
        {
            this.canvas.width = w * multiplier;
            this.canvas.height = h * multiplier;
            if (isiOSRetina)
            {
                jQuery(this.canvas).css({"width": w + "px",
                                        "height": h + "px"});
            }
        }
        if (this.overlay_canvas)
        {
            this.overlay_canvas.width = w;
            this.overlay_canvas.height = h;
        }
        if (this.glwrap)
            this.glwrap.setSize(w, h);
        if (this.isDirectCanvas)
        {
            this.ctx.width = w;
            this.ctx.height = h;
        }
        if (this.ctx)
        {
            this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
            this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
            this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
            this.ctx["imageSmoothingEnabled"] = this.linearSampling;
        }
        /*
        if (!this.isDomFree && this.canvas && /webkit/i.test(navigator.userAgent) && !this.isAwesomium)
        {
            var this_ = this;
            window.setTimeout(function () {
                if (webkitRepaintFlag)
                    return;
                webkitRepaintFlag = true;
                var n = document.createTextNode(".");
                this_.canvas.parentElement.insertBefore(n, this_.canvas);
                window.setTimeout(function () {
                    this_.canvas.parentElement.removeChild(n);
                    webkitRepaintFlag = false;
                }, 33);
            }, 33);
        }
        */
        if (tryHideAddressBar && addressBarHeight > 0)
        {
            window.setTimeout(function () {
                window.scrollTo(0, 1);
            }, 100);
        }
    };
    Runtime.prototype.onContextLost = function ()
    {
        this.is_WebGL_context_lost = true;
        var i, len, t;
        for (i = 0, len = this.types_by_index.length; i < len; i++)
        {
            t = this.types_by_index[i];
            if (t.onLostWebGLContext)
                t.onLostWebGLContext();
        }
    };
    Runtime.prototype.onContextRestored = function ()
    {
        this.is_WebGL_context_lost = false;
        var i, len, t;
        for (i = 0, len = this.types_by_index.length; i < len; i++)
        {
            t = this.types_by_index[i];
            if (t.onRestoreWebGLContext)
                t.onRestoreWebGLContext();
        }
    };
    Runtime.prototype.positionOverlayCanvas = function()
    {
        var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
        var overlay_position = isfullscreen ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
        overlay_position.position = "absolute";
        jQuery(this.overlay_canvas).css(overlay_position);
    };
    var caf = window["cancelAnimationFrame"] ||
      window["mozCancelAnimationFrame"]    ||
      window["webkitCancelAnimationFrame"] ||
      window["msCancelAnimationFrame"]     ||
      window["oCancelAnimationFrame"];
    function performance_now()
    {
        if (typeof window["performance"] !== "undefined")
        {
            var winperf = window["performance"];
            if (typeof winperf.now !== "undefined")
                return winperf.now();
            else if (typeof winperf["webkitNow"] !== "undefined")
                return winperf["webkitNow"]();
            else if (typeof winperf["msNow"] !== "undefined")
                return winperf["msNow"]();
        }
        return Date.now();
    };
    cr.performance_now = performance_now;
    Runtime.prototype["setSuspended"] = function (s)
    {
        var i, len;
        if (s && !this.isSuspended)
        {
            this.isSuspended = true;            // next tick will be last
            if (this.raf_id !== 0)
                caf(this.raf_id);
            if (this.timeout_id !== 0)
                clearTimeout(this.timeout_id);
            for (i = 0, len = this.suspend_events.length; i < len; i++)
                this.suspend_events[i](true);
        }
        else if (!s && this.isSuspended)
        {
            this.isSuspended = false;
            this.last_tick_time = performance_now();    // ensure first tick is a zero-dt one
            this.last_fps_time = performance_now();     // reset FPS counter
            this.framecount = 0;
            for (i = 0, len = this.suspend_events.length; i < len; i++)
                this.suspend_events[i](false);
            this.tick();                        // kick off runtime again
        }
    };
    Runtime.prototype.addSuspendCallback = function (f)
    {
        this.suspend_events.push(f);
    };
    Runtime.prototype.load = function ()
    {
;
        var pm = cr.getProjectModel();
        this.name = pm[0];
        this.first_layout = pm[1];
        this.fullscreen_mode = pm[11];  // 0 = off, 1 = crop, 2 = scale, 3 = letterbox scale, 4 = integer letterbox scale
        this.fullscreen_mode_set = pm[11];
        if (this.isDomFree && pm[11] >= 3)
        {
            cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale'");
            this.fullscreen_mode = 2;
            this.fullscreen_mode_set = 2;
        }
        this.uses_loader_layout = pm[17];
        this.loaderstyle = pm[18];
        if (this.loaderstyle === 0)
        {
            this.loaderlogo = new Image();
            this.loaderlogo.src = "logo.png";
        }
        this.system = new cr.system_object(this);
        var i, len, j, lenj, k, lenk, idstr, m, b, t, f;
        var plugin, plugin_ctor;
        for (i = 0, len = pm[2].length; i < len; i++)
        {
            m = pm[2][i];
;
            cr.add_common_aces(m);
            plugin = new m[0](this);
            plugin.singleglobal = m[1];
            plugin.is_world = m[2];
            plugin.must_predraw = m[9];
            if (plugin.onCreate)
                plugin.onCreate();  // opportunity to override default ACEs
            cr.seal(plugin);
            this.plugins.push(plugin);
        }
        pm = cr.getProjectModel();
        for (i = 0, len = pm[3].length; i < len; i++)
        {
            m = pm[3][i];
            plugin_ctor = m[1];
;
            plugin = null;
            for (j = 0, lenj = this.plugins.length; j < lenj; j++)
            {
                if (this.plugins[j] instanceof plugin_ctor)
                {
                    plugin = this.plugins[j];
                    break;
                }
            }
;
;
            var type_inst = new plugin.Type(plugin);
;
            type_inst.name = m[0];
            type_inst.is_family = m[2];
            type_inst.vars_count = m[3];
            type_inst.behs_count = m[4];
            type_inst.fx_count = m[5];
            if (type_inst.is_family)
            {
                type_inst.members = [];             // types in this family
                type_inst.family_index = this.family_count++;
                type_inst.families = null;
            }
            else
            {
                type_inst.members = null;
                type_inst.family_index = -1;
                type_inst.families = [];            // families this type belongs to
            }
            type_inst.family_var_map = null;
            type_inst.family_beh_map = null;
            type_inst.family_fx_map = null;
            if (m[6])
            {
                type_inst.texture_file = m[6][0];
                type_inst.texture_filesize = m[6][1];
            }
            else
            {
                type_inst.texture_file = null;
                type_inst.texture_filesize = 0;
            }
            if (m[7])
            {
                type_inst.animations = m[7];
            }
            else
            {
                type_inst.animations = null;
            }
            type_inst.index = i;                                // save index in to types array in type
            type_inst.instances = [];                           // all instances of this type
            type_inst.deadCache = [];                           // destroyed instances to recycle next create
            type_inst.solstack = [new cr.selection(type_inst)]; // initialise SOL stack with one empty SOL
            type_inst.cur_sol = 0;
            type_inst.default_instance = null;
            type_inst.stale_iids = true;
            type_inst.updateIIDs = cr.type_updateIIDs;
            type_inst.getFirstPicked = cr.type_getFirstPicked;
            type_inst.getPairedInstance = cr.type_getPairedInstance;
            type_inst.getCurrentSol = cr.type_getCurrentSol;
            type_inst.pushCleanSol = cr.type_pushCleanSol;
            type_inst.pushCopySol = cr.type_pushCopySol;
            type_inst.popSol = cr.type_popSol;
            type_inst.getBehaviorByName = cr.type_getBehaviorByName;
            type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
            type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
            type_inst.extra = {};
            type_inst.toString = cr.type_toString;
            type_inst.behaviors = [];
            for (j = 0, lenj = m[8].length; j < lenj; j++)
            {
                b = m[8][j];
                var behavior_ctor = b[1];
                var behavior_plugin = null;
                for (k = 0, lenk = this.behaviors.length; k < lenk; k++)
                {
                    if (this.behaviors[k] instanceof behavior_ctor)
                    {
                        behavior_plugin = this.behaviors[k];
                        break;
                    }
                }
                if (!behavior_plugin)
                {
                    behavior_plugin = new behavior_ctor(this);
                    behavior_plugin.my_instances = new cr.ObjectSet();  // instances of this behavior
                    if (behavior_plugin.onCreate)
                        behavior_plugin.onCreate();
                    cr.seal(behavior_plugin);
                    this.behaviors.push(behavior_plugin);
                }
                var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
                behavior_type.name = b[0];
                behavior_type.onCreate();
                cr.seal(behavior_type);
                type_inst.behaviors.push(behavior_type);
            }
            type_inst.global = m[9];
            type_inst.isOnLoaderLayout = m[10];
            type_inst.effect_types = [];
            for (j = 0, lenj = m[11].length; j < lenj; j++)
            {
                type_inst.effect_types.push({
                    id: m[11][j][0],
                    name: m[11][j][1],
                    shaderindex: -1,
                    active: true,
                    index: j
                });
            }
            if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world)
            {
                type_inst.onCreate();
                cr.seal(type_inst);
            }
            if (type_inst.name)
                this.types[type_inst.name] = type_inst;
            this.types_by_index.push(type_inst);
            if (plugin.singleglobal)
            {
                var instance = new plugin.Instance(type_inst);
                instance.uid = this.next_uid;
                this.next_uid++;
                instance.iid = 0;
                instance.get_iid = cr.inst_get_iid;
                instance.toString = cr.inst_toString;
                instance.properties = m[12];
                instance.onCreate();
                cr.seal(instance);
                type_inst.instances.push(instance);
            }
        }
        for (i = 0, len = pm[4].length; i < len; i++)
        {
            var familydata = pm[4][i];
            var familytype = this.types_by_index[familydata[0]];
            var familymember;
            for (j = 1, lenj = familydata.length; j < lenj; j++)
            {
                familymember = this.types_by_index[familydata[j]];
                familymember.families.push(familytype);
                familytype.members.push(familymember);
            }
        }
        if (this.family_count > 0)
        {
            for (i = 0, len = this.types_by_index.length; i < len; i++)
            {
                t = this.types_by_index[i];
                if (t.is_family || !t.families.length)
                    continue;
                t.family_var_map = new Array(this.family_count);
                t.family_beh_map = new Array(this.family_count);
                t.family_fx_map = new Array(this.family_count);
                var all_fx = [];
                var varsum = 0;
                var behsum = 0;
                var fxsum = 0;
                for (j = 0, lenj = t.families.length; j < lenj; j++)
                {
                    f = t.families[j];
                    t.family_var_map[f.family_index] = varsum;
                    varsum += f.vars_count;
                    t.family_beh_map[f.family_index] = behsum;
                    behsum += f.behs_count;
                    t.family_fx_map[f.family_index] = fxsum;
                    fxsum += f.fx_count;
                    for (k = 0, lenk = f.effect_types.length; k < lenk; k++)
                        all_fx.push(cr.shallowCopy({}, f.effect_types[k]));
                }
                t.effect_types = all_fx.concat(t.effect_types);
                for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
                    t.effect_types[j].index = j;
            }
        }
        for (i = 0, len = pm[5].length; i < len; i++)
        {
            m = pm[5][i];
            var layout = new cr.layout(this, m);
            cr.seal(layout);
            this.layouts[layout.name] = layout;
            this.layouts_by_index.push(layout);
        }
        for (i = 0, len = pm[6].length; i < len; i++)
        {
            m = pm[6][i];
            var sheet = new cr.eventsheet(this, m);
            cr.seal(sheet);
            this.eventsheets[sheet.name] = sheet;
            this.eventsheets_by_index.push(sheet);
        }
        for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
            this.eventsheets_by_index[i].postInit();
        for (i = 0, len = this.triggers_to_postinit.length; i < len; i++)
            this.triggers_to_postinit[i].postInit();
        delete this.triggers_to_postinit;
        this.files_subfolder = pm[7];
        this.pixel_rounding = pm[8];
        this.original_width = pm[9];
        this.original_height = pm[10];
        this.aspect_scale = 1.0;
        this.enableWebGL = pm[12];
        this.linearSampling = pm[13];
        this.clearBackground = pm[14];
        this.versionstr = pm[15];
        var iOSretina = pm[16];
        if (iOSretina === 2)
            iOSretina = (this.isiPhone ? 1 : 0);
        this.useiOSRetina = (iOSretina !== 0);
        this.hideAddressBar = pm[19];
        this.start_time = Date.now();
    };
    Runtime.prototype.findWaitingTexture = function (src)
    {
        var i, len;
        for (i = 0, len = this.wait_for_textures.length; i < len; i++)
        {
            if (this.wait_for_textures[i].src === src)
                return this.wait_for_textures[i];
        }
        return null;
    };
    Runtime.prototype.areAllTexturesLoaded = function ()
    {
        var totalsize = 0;
        var completedsize = 0;
        var ret = true;
        var i, len;
        for (i = 0, len = this.wait_for_textures.length; i < len; i++)
        {
            var filesize = this.wait_for_textures[i].cr_filesize;
            if (!filesize || filesize <= 0)
                filesize = 50000;
            totalsize += filesize;
            if (this.wait_for_textures[i].complete || this.wait_for_textures[i]["loaded"])
                completedsize += filesize;
            else
                ret = false;    // not all textures loaded
        }
        if (totalsize == 0)
            this.progress = 0;
        else
            this.progress = (completedsize / totalsize);
        return ret;
    };
    Runtime.prototype.go = function ()
    {
        if (!this.ctx && !this.glwrap)
            return;
        var ctx = this.ctx || this.overlay_ctx;
        if (this.overlay_canvas)
            this.positionOverlayCanvas();
        this.progress = 0;
        this.last_progress = -1;
        if (this.areAllTexturesLoaded())
            this.go_textures_done();
        else
        {
            var ms_elapsed = Date.now() - this.start_time;
            if (this.loaderstyle !== 3 && ms_elapsed >= 500 && this.last_progress != this.progress)
            {
                ctx.clearRect(0, 0, this.width, this.height);
                var mx = this.width / 2;
                var my = this.height / 2;
                var haslogo = (this.loaderstyle === 0 && this.loaderlogo.complete);
                var hlw = 40;
                var hlh = 0;
                var logowidth = 80;
                if (haslogo)
                {
                    logowidth = this.loaderlogo.width;
                    hlw = logowidth / 2;
                    hlh = this.loaderlogo.height / 2;
                    ctx.drawImage(this.loaderlogo, cr.floor(mx - hlw), cr.floor(my - hlh));
                }
                if (this.loaderstyle <= 1)
                {
                    my += hlh + (haslogo ? 12 : 0);
                    mx -= hlw;
                    mx = cr.floor(mx) + 0.5;
                    my = cr.floor(my) + 0.5;
                    ctx.fillStyle = "DodgerBlue";
                    ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6);
                    ctx.strokeStyle = "black";
                    ctx.strokeRect(mx, my, logowidth, 6);
                    ctx.strokeStyle = "white";
                    ctx.strokeRect(mx - 1, my - 1, logowidth + 2, 8);
                }
                else if (this.loaderstyle === 2)
                {
                    ctx.font = "12pt Arial";
                    ctx.fillStyle = "#999";
                    ctx.textBaseLine = "middle";
                    var percent_text = Math.round(this.progress * 100) + "%";
                    var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
                    var text_width = text_dim ? text_dim.width : 0;
                    ctx.fillText(percent_text, mx - (text_width / 2), my);
                }
                this.last_progress = this.progress;
            }
            setTimeout((function (self) { return function () { self.go(); }; })(this), 100);
        }
    };
    Runtime.prototype.go_textures_done = function ()
    {
        if (this.overlay_canvas)
        {
            this.canvas.parentNode.removeChild(this.overlay_canvas);
            this.overlay_ctx = null;
            this.overlay_canvas = null;
        }
        this.start_time = Date.now();
        this.last_fps_time = performance_now();       // for counting framerate
        var i, len, t;
        if (this.uses_loader_layout)
        {
            for (i = 0, len = this.types_by_index.length; i < len; i++)
            {
                t = this.types_by_index[i];
                if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world)
                {
                    t.onCreate();
                    cr.seal(t);
                }
            }
        }
        else
            this.isloading = false;
        for (i = 0, len = this.layouts_by_index.length; i < len; i++)
        {
            this.layouts_by_index[i].createGlobalNonWorlds();
        }
        if (this.first_layout)
            this.layouts[this.first_layout].startRunning();
        else
            this.layouts_by_index[0].startRunning();
;
        if (!this.uses_loader_layout)
        {
            this.loadingprogress = 1;
            this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
        }
        this.tick();
        if (this.isDirectCanvas)
            AppMobi["webview"]["execute"]("onGameReady();");
    };
    var raf = window["requestAnimationFrame"] ||
      window["mozRequestAnimationFrame"]    ||
      window["webkitRequestAnimationFrame"] ||
      window["msRequestAnimationFrame"]     ||
      window["oRequestAnimationFrame"];
    Runtime.prototype.tick = function ()
    {
        if (this.isArcade)
        {
            var curwidth = jQuery(window).width();
            var curheight = jQuery(window).height();
            if (this.lastwidth !== curwidth || this.lastheight !== curheight)
            {
                this.lastwidth = curwidth;
                this.lastheight = curheight;
                this["setSize"](curwidth, curheight);
            }
        }
;
        var logic_start = performance_now();
        if (this.isloading)
        {
            var done = this.areAllTexturesLoaded();     // updates this.progress
            this.loadingprogress = this.progress;
            if (done)
            {
                this.isloading = false;
                this.progress = 1;
                this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
            }
        }
        this.logic();
        if ((this.redraw || (this.isAwesomium && this.tickcount < 60)) && !this.is_WebGL_context_lost)
        {
            this.redraw = false;
            if (this.glwrap)
                this.drawGL();
            else
                this.draw();
            if (this.snapshotCanvas)
            {
                if (this.canvas && this.canvas.toDataURL)
                {
                    this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
                    this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
                }
                this.snapshotCanvas = null;
            }
        }
        this.tickcount++;
        this.execcount++;
        this.framecount++;
        this.logictime += performance_now() - logic_start;
        if (this.isSuspended)
            return;
        if (raf)
            this.raf_id = raf(this.tickFunc, this.canvas);
        else
        {
            this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
        }
    };
    Runtime.prototype.logic = function ()
    {
        var i, leni, j, lenj, k, lenk, type, binst;
        var cur_time = performance_now();
        if (cur_time - this.last_fps_time >= 1000)  // every 1 second
        {
            this.last_fps_time += 1000;
            this.fps = this.framecount;
            this.framecount = 0;
            this.cpuutilisation = this.logictime;
            this.logictime = 0;
        }
        if (this.measuring_dt)
        {
            if (this.last_tick_time !== 0)
            {
                var ms_diff = cur_time - this.last_tick_time;
                if (ms_diff === 0)
                {
                    this.zeroDtCount++;
                    if (this.zeroDtCout >= 10)
                        this.measuring_dt = false;
                    this.dt1 = 1.0 / 60.0;            // 60fps assumed (0.01666...)
                }
                else
                {
                    this.dt1 = ms_diff / 1000.0; // dt measured in seconds
                    if (this.dt1 > 0.5)
                        this.dt1 = 0;
                    else if (this.dt1 > 0.1)
                        this.dt1 = 0.1;
                }
            }
            this.last_tick_time = cur_time;
        }
        this.dt = this.dt1 * this.timescale;
        this.kahanTime.add(this.dt);
        var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isAwesomiumFullscreen);
        if (this.fullscreen_mode >= 2 /* scale */ || (isfullscreen && this.fullscreen_scaling > 0))
        {
            var orig_aspect = this.original_width / this.original_height;
            var cur_aspect = this.width / this.height;
            if (cur_aspect > orig_aspect)
                this.aspect_scale = this.height / this.original_height;
            else
            {
                this.aspect_scale = this.width / this.original_width;
            }
            if (this.running_layout)
            {
                this.running_layout.scrollToX(this.running_layout.scrollX);
                this.running_layout.scrollToY(this.running_layout.scrollY);
            }
        }
        else
            this.aspect_scale = 1;
        this.ClearDeathRow();
        this.isInOnDestroy++;
        this.system.runWaits();     // prevent instance list changing
        this.isInOnDestroy--;
        this.ClearDeathRow();       // allow instance list changing
        this.isInOnDestroy++;
        for (i = 0, leni = this.types_by_index.length; i < leni; i++)
        {
            type = this.types_by_index[i];
            if (!type.behaviors.length)
                continue;   // type doesn't have any behaviors
            for (j = 0, lenj = type.instances.length; j < lenj; j++)
            {
                var inst = type.instances[j];
                for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
                {
                    inst.behavior_insts[k].tick();
                }
            }
        }
        var tickarr = this.objects_to_tick.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick();
        this.isInOnDestroy--;       // end preventing instance lists from being changed
        i = 0;
        while (this.changelayout && i++ < 10)
        {
;
            this.running_layout.stopRunning();
            this.changelayout.startRunning();
            for (i = 0, leni = this.types_by_index.length; i < leni; i++)
            {
                type = this.types_by_index[i];
                if (!type.global && !type.plugin.singleglobal)
                    continue;
                for (j = 0, lenj = type.instances.length; j < lenj; j++)
                {
                    var inst = type.instances[j];
                    if (inst.onLayoutChange)
                        inst.onLayoutChange();
                }
            }
            this.redraw = true;
            this.layout_first_tick = true;
            this.ClearDeathRow();
        }
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
            this.eventsheets_by_index[i].hasRun = false;
        if (this.running_layout.event_sheet)
            this.running_layout.event_sheet.run();
        this.registered_collisions.length = 0;
        this.layout_first_tick = false;
        this.isInOnDestroy++;       // prevent instance lists from being changed
        for (i = 0, leni = this.types_by_index.length; i < leni; i++)
        {
            type = this.types_by_index[i];
            if (!type.behaviors.length)
                continue;   // type doesn't have any behaviors
            for (j = 0, lenj = type.instances.length; j < lenj; j++)
            {
                var inst = type.instances[j];
                for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
                {
                    binst = inst.behavior_insts[k];
                    if (binst.tick2)
                        binst.tick2();
                }
            }
        }
        tickarr = this.objects_to_tick2.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick2();
        this.isInOnDestroy--;       // end preventing instance lists from being changed
    };
    Runtime.prototype.tickMe = function (inst)
    {
        this.objects_to_tick.add(inst);
    };
    Runtime.prototype.untickMe = function (inst)
    {
        this.objects_to_tick.remove(inst);
    };
    Runtime.prototype.tick2Me = function (inst)
    {
        this.objects_to_tick2.add(inst);
    };
    Runtime.prototype.untick2Me = function (inst)
    {
        this.objects_to_tick2.remove(inst);
    };
    Runtime.prototype.getDt = function (inst)
    {
        if (!inst || inst.my_timescale === -1.0)
            return this.dt;
        return this.dt1 * inst.my_timescale;
    };
    Runtime.prototype.draw = function ()
    {
        this.running_layout.draw(this.ctx);
        if (this.isDirectCanvas)
            this.ctx["present"]();
    };
    Runtime.prototype.drawGL = function ()
    {
        this.running_layout.drawGL(this.glwrap);
    };
    Runtime.prototype.addDestroyCallback = function (f)
    {
        if (f)
            this.destroycallbacks.push(f);
    };
    Runtime.prototype.removeDestroyCallback = function (f)
    {
        cr.arrayFindRemove(this.destroycallbacks, f);
    };
    Runtime.prototype.DestroyInstance = function (inst)
    {
        if (!this.deathRow.contains(inst))
        {
            this.deathRow.add(inst);
            if (this.isInClearDeathRow)
                this.deathRow.values_cache.push(inst);
            this.isInOnDestroy++;       // support recursion
            this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
            this.isInOnDestroy--;
        }
    };
    Runtime.prototype.ClearDeathRow = function ()
    {
        var inst, index, type, instances, binst;
        var i, j, k, leni, lenj, lenk;
        var w, f;
        this.isInClearDeathRow = true;
        for (i = 0, leni = this.createRow.length; i < leni; i++)
        {
            inst = this.createRow[i];
            type = inst.type;
            type.instances.push(inst);
            for (j = 0, lenj = type.families.length; j < lenj; j++)
                type.families[j].instances.push(inst);
        }
        this.createRow.length = 0;
        var arr = this.deathRow.valuesRef();    // get array of items from set
        for (i = 0; i < arr.length; i++)        // check array length every time in case it changes
        {
            inst = arr[i];
            type = inst.type;
            instances = type.instances;
            for (j = 0, lenj = this.destroycallbacks.length; j < lenj; j++)
                this.destroycallbacks[j](inst);
            cr.arrayFindRemove(instances, inst);
            if (inst.layer)
            {
                cr.arrayRemove(inst.layer.instances, inst.get_zindex());
                inst.layer.zindices_stale = true;
            }
            for (j = 0, lenj = type.families.length; j < lenj; j++)
                cr.arrayFindRemove(type.families[j].instances, inst);
            if (inst.behavior_insts)
            {
                for (j = 0, lenj = inst.behavior_insts.length; j < lenj; j++)
                {
                    binst = inst.behavior_insts[j];
                    if (binst.onDestroy)
                        binst.onDestroy();
                    binst.behavior.my_instances.remove(inst);
                }
            }
            this.objects_to_tick.remove(inst);
            this.objects_to_tick2.remove(inst);
            for (j = 0, lenj = this.system.waits.length; j < lenj; j++)
            {
                w = this.system.waits[j];
                if (w.sols.hasOwnProperty(type.index))
                    cr.arrayFindRemove(w.sols[type.index], inst);
                if (!type.is_family)
                {
                    for (k = 0, lenk = type.families.length; k < lenk; k++)
                    {
                        f = type.families[k];
                        if (w.sols.hasOwnProperty(f.index))
                            cr.arrayFindRemove(w.sols[f.index], inst);
                    }
                }
            }
            if (inst.onDestroy)
                inst.onDestroy();
            this.objectcount--;
            if (type.deadCache.length < 32)
                type.deadCache.push(inst);
            type.stale_iids = true;
        }
        if (!this.deathRow.isEmpty())
            this.redraw = true;
        this.deathRow.clear();
        this.isInClearDeathRow = false;
    };
    Runtime.prototype.createInstance = function (type, layer, sx, sy)
    {
        if (type.is_family)
        {
            var i = cr.floor(Math.random() * type.members.length);
            return this.createInstance(type.members[i], layer, sx, sy);
        }
        return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy);
    };
    var all_behaviors = [];
    Runtime.prototype.createInstanceFromInit = function (initial_inst, layer, is_startup_instance, sx, sy)
    {
        var i, len, j, lenj, p, effect_fallback;
;
        var type = this.types_by_index[initial_inst[1]];
;
;
        var is_world = type.plugin.is_world;
;
        if (this.isloading && is_world && !type.isOnLoaderLayout)
            return null;
        if (is_world && !this.glwrap && initial_inst[0][11] === 11)
            return null;
        if (!is_world)
            layer = null;
        var inst;
        var recycled_inst = false;
        if (type.deadCache.length)
        {
            inst = type.deadCache.pop();
            recycled_inst = true;
            type.plugin.Instance.call(inst, type);
        }
        else
            inst = new type.plugin.Instance(type);
        inst.uid = this.next_uid;
        this.next_uid++;
        inst.iid = 0;
        inst.get_iid = cr.inst_get_iid;
        type.stale_iids = true;
        var initial_vars = initial_inst[2];
        if (recycled_inst)
        {
            for (i = 0, len = initial_vars.length; i < len; i++)
                inst.instance_vars[i] = initial_vars[i];
            cr.wipe(inst.extra);
        }
        else
        {
            inst.instance_vars = initial_vars.slice(0);
            inst.extra = {};
        }
        if (is_world)
        {
            var wm = initial_inst[0];
;
            inst.x = cr.is_undefined(sx) ? wm[0] : sx;
            inst.y = cr.is_undefined(sy) ? wm[1] : sy;
            inst.z = wm[2];
            inst.width = wm[3];
            inst.height = wm[4];
            inst.depth = wm[5];
            inst.angle = wm[6];
            inst.opacity = wm[7];
            inst.hotspotX = wm[8];
            inst.hotspotY = wm[9];
            inst.blend_mode = wm[10];
            effect_fallback = wm[11];
            if (!this.glwrap && type.effect_types.length)   // no WebGL renderer and shaders used
                inst.blend_mode = effect_fallback;          // use fallback blend mode - destroy mode was handled above
            inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
            if (this.gl)
                cr.setGLBlend(inst, inst.blend_mode, this.gl);
            if (recycled_inst)
            {
                for (i = 0, len = wm[12].length; i < len; i++)
                {
                    for (j = 0, lenj = wm[12][i].length; j < lenj; j++)
                        inst.effect_params[i][j] = wm[12][i][j];
                }
                inst.bbox.set(0, 0, 0, 0);
                inst.bquad.set_from_rect(inst.bbox);
                inst.bbox_changed_callbacks.length = 0;
            }
            else
            {
                inst.effect_params = wm[12].slice(0);
                for (i = 0, len = inst.effect_params.length; i < len; i++)
                    inst.effect_params[i] = wm[12][i].slice(0);
                inst.active_effect_types = [];
                inst.active_effect_flags = [];
                inst.active_effect_flags.length = type.effect_types.length;
                inst.bbox = new cr.rect(0, 0, 0, 0);
                inst.bquad = new cr.quad();
                inst.bbox_changed_callbacks = [];
                inst.set_bbox_changed = cr.set_bbox_changed;
                inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
                inst.contains_pt = cr.inst_contains_pt;
                inst.update_bbox = cr.update_bbox;
                inst.get_zindex = cr.inst_get_zindex;
            }
            for (i = 0, len = type.effect_types.length; i < len; i++)
                inst.active_effect_flags[i] = true;
            inst.updateActiveEffects = cr.inst_updateActiveEffects;
            inst.updateActiveEffects();
            inst.uses_shaders = !!inst.active_effect_types.length;
            inst.bbox_changed = true;
            inst.visible = true;
            inst.my_timescale = -1.0;
            inst.layer = layer;
            inst.zindex = layer.instances.length;   // will be placed at top of current layer
            this.redraw = true;
        }
        inst.toString = cr.inst_toString;
        var initial_props, binst;
        all_behaviors.length = 0;
        for (i = 0, len = type.families.length; i < len; i++)
        {
            all_behaviors.push.apply(all_behaviors, type.families[i].behaviors);
        }
        all_behaviors.push.apply(all_behaviors, type.behaviors);
        if (recycled_inst)
        {
            for (i = 0, len = all_behaviors.length; i < len; i++)
            {
                var btype = all_behaviors[i];
                binst = inst.behavior_insts[i];
                btype.behavior.Instance.call(binst, btype, inst);
                initial_props = initial_inst[3][i];
                for (j = 0, lenj = initial_props.length; j < lenj; j++)
                    binst.properties[j] = initial_props[j];
                binst.onCreate();
                btype.behavior.my_instances.add(inst);
            }
        }
        else
        {
            inst.behavior_insts = [];
            for (i = 0, len = all_behaviors.length; i < len; i++)
            {
                var btype = all_behaviors[i];
                var binst = new btype.behavior.Instance(btype, inst);
                binst.properties = initial_inst[3][i].slice(0);
                binst.onCreate();
                cr.seal(binst);
                inst.behavior_insts.push(binst);
                btype.behavior.my_instances.add(inst);
            }
        }
        initial_props = initial_inst[4];
        if (recycled_inst)
        {
            for (i = 0, len = initial_props.length; i < len; i++)
                inst.properties[i] = initial_props[i];
        }
        else
            inst.properties = initial_props.slice(0);
        this.createRow.push(inst);
        if (layer)
        {
;
            layer.instances.push(inst);
        }
        this.objectcount++;
        inst.onCreate();
        if (!recycled_inst)
            cr.seal(inst);
        for (i = 0, len = inst.behavior_insts.length; i < len; i++)
        {
            if (inst.behavior_insts[i].postCreate)
                inst.behavior_insts[i].postCreate();
        }
        return inst;
    };
    Runtime.prototype.getLayerByName = function (layer_name)
    {
        var i, len;
        for (i = 0, len = this.running_layout.layers.length; i < len; i++)
        {
            var layer = this.running_layout.layers[i];
            if (layer.name.toLowerCase() === layer_name.toLowerCase())
                return layer;
        }
        return null;
    };
    Runtime.prototype.getLayerByNumber = function (index)
    {
        index = cr.floor(index);
        if (index < 0)
            index = 0;
        if (index >= this.running_layout.layers.length)
            index = this.running_layout.layers.length - 1;
        return this.running_layout.layers[index];
    };
    Runtime.prototype.getLayer = function (l)
    {
        if (cr.is_number(l))
            return this.getLayerByNumber(l);
        else
            return this.getLayerByName(l.toString());
    };
    Runtime.prototype.clearSol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].getCurrentSol().select_all = true;
        }
    };
    Runtime.prototype.pushCleanSol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].pushCleanSol();
        }
    };
    Runtime.prototype.pushCopySol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].pushCopySol();
        }
    };
    Runtime.prototype.popSol = function (solModifiers)
    {
        var i, len;
        for (i = 0, len = solModifiers.length; i < len; i++)
        {
            solModifiers[i].popSol();
        }
    };
    Runtime.prototype.testAndSelectCanvasPointOverlap = function (type, ptx, pty, inverted)
    {
        var sol = type.getCurrentSol();
        var i, j, inst, len;
        var lx, ly;
        if (sol.select_all)
        {
            if (!inverted)
            {
                sol.select_all = false;
                sol.instances.length = 0;   // clear contents
            }
            for (i = 0, len = type.instances.length; i < len; i++)
            {
                inst = type.instances[i];
                inst.update_bbox();
                lx = inst.layer.canvasToLayer(ptx, pty, true);
                ly = inst.layer.canvasToLayer(ptx, pty, false);
                if (inst.contains_pt(lx, ly))
                {
                    if (inverted)
                        return false;
                    else
                        sol.instances.push(inst);
                }
            }
        }
        else
        {
            j = 0;
            for (i = 0, len = sol.instances.length; i < len; i++)
            {
                inst = sol.instances[i];
                inst.update_bbox();
                lx = inst.layer.canvasToLayer(ptx, pty, true);
                ly = inst.layer.canvasToLayer(ptx, pty, false);
                if (inst.contains_pt(lx, ly))
                {
                    if (inverted)
                        return false;
                    else
                    {
                        sol.instances[j] = sol.instances[i];
                        j++;
                    }
                }
            }
            if (!inverted)
                sol.instances.length = j;
        }
        if (inverted)
            return true;        // did not find anything overlapping
        else
            return sol.hasObjects();
    };
    Runtime.prototype.testOverlap = function (a, b)
    {
        if (!a || !b || a === b)
            return false;
        a.update_bbox();
        b.update_bbox();
        if (!a.bbox.intersects_rect(b.bbox))
            return false;
        if (!a.bquad.intersects_quad(b.bquad))
            return false;
        var haspolya = (a.collision_poly && !a.collision_poly.is_empty());
        var haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
        if (!haspolya && !haspolyb)
            return true;
        var polya, polyb;
        if (haspolya)
        {
            a.collision_poly.cache_poly(a.width, a.height, a.angle);
            polya = a.collision_poly;
        }
        else
        {
            this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
            polya = this.temp_poly;
        }
        if (haspolyb)
        {
            b.collision_poly.cache_poly(b.width, b.height, b.angle);
            polyb = b.collision_poly;
        }
        else
        {
            this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
            polyb = this.temp_poly;
        }
        return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y);
    };
    Runtime.prototype.testOverlapSolid = function (inst)
    {
        var solid = null;
        var i, len, s;
        if (!cr.behaviors.solid)
            return null;
        for (i = 0, len = this.behaviors.length; i < len; i++)
        {
            if (this.behaviors[i] instanceof cr.behaviors.solid)
            {
                solid = this.behaviors[i];
                break;
            }
        }
        if (!solid)
            return null;
        var solids = solid.my_instances.valuesRef();
        for (i = 0, len = solids.length; i < len; ++i)
        {
            s = solids[i];
            if (!s.extra.solidEnabled)
                continue;
            if (this.testOverlap(inst, s))
                return s;
        }
        return null;
    };
    var jumpthru_array_ret = [];
    Runtime.prototype.testOverlapJumpThru = function (inst, all)
    {
        var jumpthru = null;
        var i, len, s;
        if (!cr.behaviors.jumpthru)
            return null;
        for (i = 0, len = this.behaviors.length; i < len; i++)
        {
            if (this.behaviors[i] instanceof cr.behaviors.jumpthru)
            {
                jumpthru = this.behaviors[i];
                break;
            }
        }
        if (!jumpthru)
            return null;
        var ret = null;
        if (all)
        {
            ret = jumpthru_array_ret;
            ret.length = 0;
        }
        var jumpthrus = jumpthru.my_instances.valuesRef();
        for (i = 0, len = jumpthrus.length; i < len; ++i)
        {
            s = jumpthrus[i];
            if (!s.extra.jumpthruEnabled)
                continue;
            if (this.testOverlap(inst, s))
            {
                if (all)
                    ret.push(s);
                else
                    return s;
            }
        }
        return ret;
    };
    Runtime.prototype.pushOutSolid = function (inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru)
    {
        var push_dist = dist || 50;
        var oldx = inst.x
        var oldy = inst.y;
        var i;
        var last_overlapped = null;
        for (i = 0; i < push_dist; i++)
        {
            inst.x = (oldx + (xdir * i));
            inst.y = (oldy + (ydir * i));
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, last_overlapped))
            {
                last_overlapped = this.testOverlapSolid(inst);
                if (!last_overlapped)
                {
                    if (include_jumpthrus)
                    {
                        if (specific_jumpthru)
                            last_overlapped = (this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null);
                        else
                            last_overlapped = this.testOverlapJumpThru(inst);
                    }
                    if (!last_overlapped)
                        return true;
                }
            }
        }
        inst.x = oldx;
        inst.y = oldy;
        inst.set_bbox_changed();
        return false;
    };
    Runtime.prototype.pushOutSolidNearest = function (inst, max_dist_)
    {
        var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
        var dist = 0;
        var oldx = inst.x
        var oldy = inst.y;
        var dir = 0;
        var dx = 0, dy = 0;
        var last_overlapped = null;
        while (dist <= max_dist)
        {
            switch (dir) {
            case 0:     dx = 0; dy = -1; dist++; break;
            case 1:     dx = 1; dy = -1; break;
            case 2:     dx = 1; dy = 0; break;
            case 3:     dx = 1; dy = 1; break;
            case 4:     dx = 0; dy = 1; break;
            case 5:     dx = -1; dy = 1; break;
            case 6:     dx = -1; dy = 0; break;
            case 7:     dx = -1; dy = -1; break;
            }
            dir = (dir + 1) % 8;
            inst.x = cr.floor(oldx + (dx * dist));
            inst.y = cr.floor(oldy + (dy * dist));
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, last_overlapped))
            {
                last_overlapped = this.testOverlapSolid(inst);
                if (!last_overlapped)
                    return true;
            }
        }
        inst.x = oldx;
        inst.y = oldy;
        inst.set_bbox_changed();
        return false;
    };
    Runtime.prototype.registerCollision = function (a, b)
    {
        this.registered_collisions.push([a, b]);
    };
    Runtime.prototype.checkRegisteredCollision = function (a, b)
    {
        var i, len, x;
        for (i = 0, len = this.registered_collisions.length; i < len; i++)
        {
            x = this.registered_collisions[i];
            if ((x[0] == a && x[1] == b) || (x[0] == b && x[1] == a))
                return true;
        }
        return false;
    };
    Runtime.prototype.calculateSolidBounceAngle = function(inst, startx, starty, obj)
    {
        var objx = inst.x;
        var objy = inst.y;
        var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
        var startangle = cr.angleTo(startx, starty, objx, objy);
        var firstsolid = obj || this.testOverlapSolid(inst);
        if (!firstsolid)
            return cr.clamp_angle(startangle + cr.PI);
        var cursolid = firstsolid;
        var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
        var increment = cr.to_radians(5);   // 5 degree increments
        for (i = 1; i < 36; i++)
        {
            curangle = startangle - i * increment;
            inst.x = startx + Math.cos(curangle) * radius;
            inst.y = starty + Math.sin(curangle) * radius;
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, cursolid))
            {
                cursolid = obj ? null : this.testOverlapSolid(inst);
                if (!cursolid)
                {
                    anticlockwise_free_angle = curangle;
                    break;
                }
            }
        }
        if (i === 36)
            anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
        var cursolid = firstsolid;
        for (i = 1; i < 36; i++)
        {
            curangle = startangle + i * increment;
            inst.x = startx + Math.cos(curangle) * radius;
            inst.y = starty + Math.sin(curangle) * radius;
            inst.set_bbox_changed();
            if (!this.testOverlap(inst, cursolid))
            {
                cursolid = obj ? null : this.testOverlapSolid(inst);
                if (!cursolid)
                {
                    clockwise_free_angle = curangle;
                    break;
                }
            }
        }
        if (i === 36)
            clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
        inst.x = objx;
        inst.y = objy;
        inst.set_bbox_changed();
        if (clockwise_free_angle === anticlockwise_free_angle)
            return clockwise_free_angle;
        var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
        var normal;
        if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle))
        {
            normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
        }
        else
        {
            normal = cr.clamp_angle(clockwise_free_angle + half_diff);
        }
;
        var vx = Math.cos(startangle);
        var vy = Math.sin(startangle);
        var nx = Math.cos(normal);
        var ny = Math.sin(normal);
        var v_dot_n = vx * nx + vy * ny;
        var rx = vx - 2 * v_dot_n * nx;
        var ry = vy - 2 * v_dot_n * ny;
        return cr.angleTo(0, 0, rx, ry);
    };
    var triggerSheetStack = [];
    var triggerSheetIndex = -1;
    Runtime.prototype.trigger = function (method, inst, value /* for fast triggers */)
    {
;
        if (!this.running_layout)
            return false;
        var sheet = this.running_layout.event_sheet;
        if (!sheet)
            return false;     // no event sheet active; nothing to trigger
        triggerSheetIndex++;
        if (triggerSheetIndex === triggerSheetStack.length)
            triggerSheetStack.push(new cr.ObjectSet());
        else
            triggerSheetStack[triggerSheetIndex].clear();
        var ret = this.triggerOnSheet(method, inst, sheet, value);
        triggerSheetIndex--;
        return ret;
    };
    Runtime.prototype.triggerOnSheet = function (method, inst, sheet, value)
    {
        var alreadyTriggeredSheets = triggerSheetStack[triggerSheetIndex];
        if (alreadyTriggeredSheets.contains(sheet))
            return false;
        alreadyTriggeredSheets.add(sheet);
        var includes = sheet.includes.valuesRef();
        var ret = false;
        var i, leni, r;
        for (i = 0, leni = includes.length; i < leni; i++)
        {
            r = this.triggerOnSheet(method, inst, includes[i], value);
            ret = ret || r;
        }
        if (!inst)
        {
            r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
            ret = ret || r;
        }
        else
        {
            r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
            ret = ret || r;
            for (i = 0, leni = inst.type.families.length; i < leni; i++)
            {
                r = this.triggerOnSheetForTypeName(method, inst, inst.type.families[i].name, sheet, value);
                ret = ret || r;
            }
        }
        return ret;             // true if anything got triggered
    };
    Runtime.prototype.triggerOnSheetForTypeName = function (method, inst, type_name, sheet, value)
    {
        var i, leni;
        var ret = false, ret2 = false;
        var trig, index;
        var fasttrigger = (typeof value !== "undefined");
        var triggers = (fasttrigger ? sheet.fasttriggers : sheet.triggers);
        var obj_entry = triggers[type_name];
        if (!obj_entry)
            return ret;
        var triggers_list = null;
        for (i = 0, leni = obj_entry.length; i < leni; i++)
        {
            if (obj_entry[i].method == method)
            {
                triggers_list = obj_entry[i].evs;
                break;
            }
        }
        if (!triggers_list)
            return ret;
        var triggers_to_fire;
        if (fasttrigger)
        {
            triggers_to_fire = triggers_list[value];
        }
        else
        {
            triggers_to_fire = triggers_list;
        }
        if (!triggers_to_fire)
            return null;
        for (i = 0, leni = triggers_to_fire.length; i < leni; i++)
        {
            trig = triggers_to_fire[i][0];
            index = triggers_to_fire[i][1];
            ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
            ret = ret || ret2;
        }
        return ret;
    };
    Runtime.prototype.executeSingleTrigger = function (inst, type_name, trig, index)
    {
        var i, leni;
        var ret = false;
        this.pushCleanSol(trig.solModifiersIncludingParents);
        var event_stack = this.pushEventStack(trig);
        if (inst)
        {
            var sol = this.types[type_name].getCurrentSol();
            sol.select_all = false;
            sol.instances.length = 1;
            sol.instances[0] = inst;
        }
        var ok_to_run = true;
        if (trig.parent)
        {
            var temp_parents_arr = event_stack.temp_parents_arr;
            var cur_parent = trig.parent;
            while (cur_parent)
            {
                temp_parents_arr.push(cur_parent);
                cur_parent = cur_parent.parent;
            }
            temp_parents_arr.reverse();
            for (i = 0, leni = temp_parents_arr.length; i < leni; i++)
            {
                if (!temp_parents_arr[i].run_pretrigger())   // parent event failed
                {
                    ok_to_run = false;
                    break;
                }
            }
        }
        if (ok_to_run)
        {
            this.execcount++;
            if (trig.orblock)
                trig.run_orblocktrigger(index);
            else
                trig.run();
            ret = ret || event_stack.last_event_true;
        }
        this.popSol(trig.solModifiersIncludingParents);
        this.popEventStack();
        if (this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents && (!this.deathRow.isEmpty() || this.createRow.length))
        {
            this.ClearDeathRow();
        }
        return ret;
    };
    Runtime.prototype.getCurrentCondition = function ()
    {
        var evinfo = this.getCurrentEventStack();
        return evinfo.current_event.conditions[evinfo.cndindex];
    };
    Runtime.prototype.getCurrentAction = function ()
    {
        var evinfo = this.getCurrentEventStack();
        return evinfo.current_event.actions[evinfo.actindex];
    };
    Runtime.prototype.pushEventStack = function (cur_event)
    {
        this.event_stack_index++;
        if (this.event_stack_index >= this.event_stack.length)
            this.event_stack.push(new cr.eventStackFrame());
        var ret = this.getCurrentEventStack();
        ret.reset(cur_event);
        return ret;
    };
    Runtime.prototype.popEventStack = function ()
    {
;
        this.event_stack_index--;
    };
    Runtime.prototype.getCurrentEventStack = function ()
    {
        return this.event_stack[this.event_stack_index];
    };
    Runtime.prototype.pushLoopStack = function (name_)
    {
        this.loop_stack_index++;
        if (this.loop_stack_index >= this.loop_stack.length)
        {
            this.loop_stack.push(cr.seal({ name: name_, index: 0, stopped: false }));
        }
        var ret = this.getCurrentLoop();
        ret.name = name_;
        ret.index = 0;
        ret.stopped = false;
        return ret;
    };
    Runtime.prototype.popLoopStack = function ()
    {
;
        this.loop_stack_index--;
    };
    Runtime.prototype.getCurrentLoop = function ()
    {
        return this.loop_stack[this.loop_stack_index];
    };
    Runtime.prototype.getEventVariableByName = function (name, scope)
    {
        var i, leni, j, lenj, sheet, e;
        while (scope)
        {
            for (i = 0, leni = scope.subevents.length; i < leni; i++)
            {
                e = scope.subevents[i];
                if (e instanceof cr.eventvariable && name.toLowerCase() === e.name.toLowerCase())
                    return e;
            }
            scope = scope.parent;
        }
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
        {
            sheet = this.eventsheets_by_index[i];
            for (j = 0, lenj = sheet.events.length; j < lenj; j++)
            {
                e = sheet.events[j];
                if (e instanceof cr.eventvariable && name.toLowerCase() === e.name.toLowerCase())
                    return e;
            }
        }
        return null;
    };
    cr.runtime = Runtime;
    cr.createRuntime = function (canvasid)
    {
        return new Runtime(document.getElementById(canvasid));
    };
    cr.createDCRuntime = function (w, h)
    {
        return new Runtime({ "dc": true, "width": w, "height": h });
    };
    window["cr_createRuntime"] = cr.createRuntime;
    window["cr_createDCRuntime"] = cr.createDCRuntime;
    window["createCocoonJSRuntime"] = function ()
    {
        window["c2cocoonjs"] = true;
        var canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var rt = new Runtime(canvas);
        window["c2runtime"] = rt;
        window.addEventListener("orientationchange", function () {
            window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
        });
        return rt;
    };
}());
window["cr_getC2Runtime"] = function()
{
    var canvas = document.getElementById("c2canvas");
    if (canvas)
        return canvas["c2runtime"];
    else if (window["c2runtime"])
        return window["c2runtime"];
}
window["cr_sizeCanvas"] = function(w, h)
{
    if (w === 0 || h === 0)
        return;
    var runtime = window["cr_getC2Runtime"]();
    if (runtime)
        runtime["setSize"](w, h);
}
window["cr_setSuspended"] = function(s)
{
    var runtime = window["cr_getC2Runtime"]();
    if (runtime)
        runtime["setSuspended"](s);
}
;
(function()
{
    function Layout(runtime, m)
    {
        this.runtime = runtime;
        this.event_sheet = null;
        this.scrollX = (this.runtime.original_width / 2);
        this.scrollY = (this.runtime.original_height / 2);
        this.scale = 1.0;
        this.angle = 0;
        this.name = m[0];
        this.width = m[1];
        this.height = m[2];
        this.unbounded_scrolling = m[3];
        this.sheetname = m[4];
        var lm = m[5];
        var i, len;
        this.layers = [];
        for (i = 0, len = lm.length; i < len; i++)
        {
            var layer = new cr.layer(this, lm[i]);
            layer.number = i;
            cr.seal(layer);
            this.layers.push(layer);
        }
        var im = m[6];
        this.initial_nonworld = [];
        for (i = 0, len = im.length; i < len; i++)
        {
            var inst = im[i];
            var type = this.runtime.types_by_index[inst[1]];
;
            if (!type.default_instance)
                type.default_instance = inst;
            this.initial_nonworld.push(inst);
        }
        this.effect_types = [];
        this.active_effect_types = [];
        this.effect_params = [];
        for (i = 0, len = m[7].length; i < len; i++)
        {
            this.effect_types.push({
                id: m[7][i][0],
                name: m[7][i][1],
                shaderindex: -1,
                active: true,
                index: i
            });
            this.effect_params.push(m[7][i][2].slice(0));
        }
        this.updateActiveEffects();
        this.rcTex = new cr.rect(0, 0, 1, 1);
        this.rcTex2 = new cr.rect(0, 0, 1, 1);
    };
    Layout.prototype.hasOpaqueBottomLayer = function ()
    {
        var layer = this.layers[0];
        return !layer.transparent && layer.opacity === 1.0 && !layer.forceOwnTexture && layer.visible;
    };
    Layout.prototype.updateActiveEffects = function ()
    {
        this.active_effect_types.length = 0;
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.active)
                this.active_effect_types.push(et);
        }
    };
    Layout.prototype.getEffectByName = function (name_)
    {
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.name === name_)
                return et;
        }
        return null;
    };
    Layout.prototype.startRunning = function ()
    {
        if (this.sheetname)
        {
            this.event_sheet = this.runtime.eventsheets[this.sheetname];
;
        }
        this.runtime.running_layout = this;
        this.scrollX = (this.runtime.original_width / 2);
        this.scrollY = (this.runtime.original_height / 2);
        var i, k, len, lenk, type, type_instances, inst;
        for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
        {
            type = this.runtime.types_by_index[i];
            if (type.is_family)
                continue;       // instances are only transferred for their real type
            type_instances = type.instances;
            for (k = 0, lenk = type_instances.length; k < lenk; k++)
            {
                inst = type_instances[k];
                if (inst.layer)
                {
                    var num = inst.layer.number;
                    if (num >= this.layers.length)
                        num = this.layers.length - 1;
                    inst.layer = this.layers[num];
                    inst.layer.instances.push(inst);
                    inst.layer.zindices_stale = true;
                }
            }
        }
        var layer;
        for (i = 0, len = this.layers.length; i < len; i++)
        {
            layer = this.layers[i];
            layer.createInitialInstances();
            layer.disableAngle = true;
            var px = layer.canvasToLayer(0, 0, true);
            var py = layer.canvasToLayer(0, 0, false);
            layer.disableAngle = false;
            if (this.runtime.pixel_rounding)
            {
                px = (px + 0.5) | 0;
                py = (py + 0.5) | 0;
            }
            layer.rotateViewport(px, py, null);
        }
        for (i = 0, len = this.initial_nonworld.length; i < len; i++)
        {
            inst = this.runtime.createInstanceFromInit(this.initial_nonworld[i], null, true);
;
        }
        this.runtime.changelayout = null;
        this.runtime.ClearDeathRow();
        this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart, null);
        for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
        {
            type = this.runtime.types_by_index[i];
            if (type.unloadTextures)
                type.unloadTextures();
        }
/*
        if (this.runtime.glwrap)
        {
            console.log("Estimated VRAM at layout start: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
        }
*/
    };
    Layout.prototype.createGlobalNonWorlds = function ()
    {
        var i, k, len, initial_inst, inst, type;
        for (i = 0, k = 0, len = this.initial_nonworld.length; i < len; i++)
        {
            initial_inst = this.initial_nonworld[i];
            type = this.runtime.types_by_index[initial_inst[1]];
            if (type.global)
                inst = this.runtime.createInstanceFromInit(initial_inst, null, true);
            else
            {
                this.initial_nonworld[k] = initial_inst;
                k++;
            }
        }
        this.initial_nonworld.length = k;
    };
    Layout.prototype.stopRunning = function ()
    {
;
/*
        if (this.runtime.glwrap)
        {
            console.log("Estimated VRAM at layout end: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
        }
*/
        this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd, null);
        this.runtime.system.waits.length = 0;
        var i, leni, j, lenj;
        var layer_instances, inst, type;
        for (i = 0, leni = this.layers.length; i < leni; i++)
        {
            layer_instances = this.layers[i].instances;
            for (j = 0, lenj = layer_instances.length; j < lenj; j++)
            {
                inst = layer_instances[j];
                if (!inst.type.global)
                    this.runtime.DestroyInstance(inst);
            }
            this.runtime.ClearDeathRow();
            layer_instances.length = 0;
            this.layers[i].zindices_stale = true;
        }
        for (i = 0, leni = this.runtime.types_by_index.length; i < leni; i++)
        {
            type = this.runtime.types_by_index[i];
            if (type.global || type.plugin.is_world || type.plugin.singleglobal)
                continue;
            for (j = 0, lenj = type.instances.length; j < lenj; j++)
                this.runtime.DestroyInstance(type.instances[j]);
            this.runtime.ClearDeathRow();
        }
    };
    Layout.prototype.draw = function (ctx)
    {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
            ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
        var i, len, l;
        for (i = 0, len = this.layers.length; i < len; i++)
        {
            l = this.layers[i];
            if (l.visible && l.opacity > 0 && l.blend_mode !== 11)
                l.draw(ctx);
        }
    };
    Layout.prototype.drawGL = function (glw)
    {
        if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
            glw.clear(0, 0, 0, 0);
        var render_to_texture = (this.active_effect_types.length > 0 || this.runtime.uses_background_blending);
        if (render_to_texture)
        {
            if (!this.runtime.layout_tex)
            {
                this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            if (this.runtime.layout_tex.c2width !== this.runtime.width || this.runtime.layout_tex.c2height !== this.runtime.height)
            {
                glw.deleteTexture(this.runtime.layout_tex);
                this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            glw.setRenderingToTexture(this.runtime.layout_tex);
        }
        var i, len;
        for (i = 0, len = this.layers.length; i < len; i++)
        {
            if (this.layers[i].visible && this.layers[i].opacity > 0)
                this.layers[i].drawGL(glw);
        }
        if (render_to_texture)
        {
            if (this.active_effect_types.length <= 1)
            {
                if (this.active_effect_types.length === 1)
                {
                    var etindex = this.active_effect_types[0].index;
                    glw.switchProgram(this.active_effect_types[0].shaderindex);
                    glw.setProgramParameters(null,                              // backTex
                                             1.0 / this.runtime.width,          // pixelWidth
                                             1.0 / this.runtime.height,         // pixelHeight
                                             0.0, 0.0,                          // destStart
                                             1.0, 1.0,                          // destEnd
                                             this.scale,                        // layerScale
                                             this.effect_params[etindex]);      // fx parameters
                    if (glw.programIsAnimated(this.active_effect_types[0].shaderindex))
                        this.runtime.redraw = true;
                }
                else
                    glw.switchProgram(0);
                glw.setRenderingToTexture(null);                // to backbuffer
                glw.setOpacity(1);
                glw.setTexture(this.runtime.layout_tex);
                glw.setAlphaBlend();
                glw.resetModelView();
                glw.updateModelView();
                var halfw = this.runtime.width / 2;
                var halfh = this.runtime.height / 2;
                glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
                glw.setTexture(null);
            }
            else
            {
                this.renderEffectChain(glw, null, null, null);
            }
        }
        glw.present();
    };
    Layout.prototype.getRenderTarget = function()
    {
        return (this.active_effect_types.length > 0 || this.runtime.uses_background_blending) ? this.runtime.layout_tex : null;
    };
    Layout.prototype.getMinLayerScale = function ()
    {
        var m = this.layers[0].getScale();
        var i, len, l;
        for (i = 1, len = this.layers.length; i < len; i++)
        {
            l = this.layers[i];
            if (l.parallaxX === 0 && l.parallaxY === 0)
                continue;
            if (l.getScale() < m)
                m = l.getScale();
        }
        return m;
    };
    Layout.prototype.scrollToX = function (x)
    {
        if (!this.unbounded_scrolling)
        {
            var widthBoundary = (this.runtime.width * (1 / this.getMinLayerScale()) / 2);
            if (x > this.width - widthBoundary)
                x = this.width - widthBoundary;
            if (x < widthBoundary)
                x = widthBoundary;
        }
        if (this.scrollX !== x)
        {
            this.scrollX = x;
            this.runtime.redraw = true;
        }
    };
    Layout.prototype.scrollToY = function (y)
    {
        if (!this.unbounded_scrolling)
        {
            var heightBoundary = (this.runtime.height * (1 / this.getMinLayerScale()) / 2);
            if (y > this.height - heightBoundary)
                y = this.height - heightBoundary;
            if (y < heightBoundary)
                y = heightBoundary;
        }
        if (this.scrollY !== y)
        {
            this.scrollY = y;
            this.runtime.redraw = true;
        }
    };
    Layout.prototype.renderEffectChain = function (glw, layer, inst, rendertarget)
    {
        var active_effect_types = inst ?
                            inst.active_effect_types :
                            layer ?
                                layer.active_effect_types :
                                this.active_effect_types;
        var layerScale = inst ? inst.layer.getScale() :
                            layer ? layer.getScale() : 1;
        var fx_tex = this.runtime.fx_tex;
        var i, len, last, temp, fx_index = 0, other_fx_index = 1;
        var y, h;
        var windowWidth = this.runtime.width;
        var windowHeight = this.runtime.height;
        var halfw = windowWidth / 2;
        var halfh = windowHeight / 2;
        var rcTex = layer ? layer.rcTex : this.rcTex;
        var rcTex2 = layer ? layer.rcTex2 : this.rcTex2;
        var screenleft = 0, clearleft = 0;
        var screentop = 0, cleartop = 0;
        var screenright = windowWidth, clearright = windowWidth;
        var screenbottom = windowHeight, clearbottom = windowHeight;
        var boxExtendHorizontal = 0;
        var boxExtendVertical = 0;
        var inst_layer_angle = inst ? inst.layer.getAngle() : 0;
        if (inst)
        {
            for (i = 0, len = active_effect_types.length; i < len; i++)
            {
                boxExtendHorizontal += glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);
                boxExtendVertical += glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex);
            }
            var bbox = inst.bbox;
            screenleft = layer.layerToCanvas(bbox.left, bbox.top, true);
            screentop = layer.layerToCanvas(bbox.left, bbox.top, false);
            screenright = layer.layerToCanvas(bbox.right, bbox.bottom, true);
            screenbottom = layer.layerToCanvas(bbox.right, bbox.bottom, false);
            if (inst_layer_angle !== 0)
            {
                var screentrx = layer.layerToCanvas(bbox.right, bbox.top, true);
                var screentry = layer.layerToCanvas(bbox.right, bbox.top, false);
                var screenblx = layer.layerToCanvas(bbox.left, bbox.bottom, true);
                var screenbly = layer.layerToCanvas(bbox.left, bbox.bottom, false);
                temp = Math.min(screenleft, screenright, screentrx, screenblx);
                screenright = Math.max(screenleft, screenright, screentrx, screenblx);
                screenleft = temp;
                temp = Math.min(screentop, screenbottom, screentry, screenbly);
                screenbottom = Math.max(screentop, screenbottom, screentry, screenbly);
                screentop = temp;
            }
            screenleft -= boxExtendHorizontal;
            screentop -= boxExtendVertical;
            screenright += boxExtendHorizontal;
            screenbottom += boxExtendVertical;
            rcTex2.left = screenleft / windowWidth;
            rcTex2.top = 1 - screentop / windowHeight;
            rcTex2.right = screenright / windowWidth;
            rcTex2.bottom = 1 - screenbottom / windowHeight;
            clearleft = screenleft = Math.floor(screenleft);
            cleartop = screentop = Math.floor(screentop);
            clearright = screenright = Math.ceil(screenright);
            clearbottom = screenbottom = Math.ceil(screenbottom);
            clearleft -= boxExtendHorizontal;
            cleartop -= boxExtendVertical;
            clearright += boxExtendHorizontal;
            clearbottom += boxExtendVertical;
            if (screenleft < 0)                 screenleft = 0;
            if (screentop < 0)                  screentop = 0;
            if (screenright > windowWidth)      screenright = windowWidth;
            if (screenbottom > windowHeight)    screenbottom = windowHeight;
            if (clearleft < 0)                  clearleft = 0;
            if (cleartop < 0)                   cleartop = 0;
            if (clearright > windowWidth)       clearright = windowWidth;
            if (clearbottom > windowHeight)     clearbottom = windowHeight;
            rcTex.left = screenleft / windowWidth;
            rcTex.top = 1 - screentop / windowHeight;
            rcTex.right = screenright / windowWidth;
            rcTex.bottom = 1 - screenbottom / windowHeight;
        }
        else
        {
            rcTex.left = rcTex2.left = 0;
            rcTex.top = rcTex2.top = 0;
            rcTex.right = rcTex2.right = 1;
            rcTex.bottom = rcTex2.bottom = 1;
        }
        var pre_draw = (inst && (((inst.angle || inst_layer_angle) && glw.programUsesDest(active_effect_types[0].shaderindex)) || boxExtendHorizontal !== 0 || boxExtendVertical !== 0 || inst.opacity !== 1 || inst.type.plugin.must_predraw)) || (layer && !inst && layer.opacity !== 1);
        glw.setAlphaBlend();
        if (pre_draw)
        {
            if (!fx_tex[fx_index])
            {
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
            {
                glw.deleteTexture(fx_tex[fx_index]);
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            glw.switchProgram(0);
            glw.setRenderingToTexture(fx_tex[fx_index]);
            h = clearbottom - cleartop;
            y = (windowHeight - cleartop) - h;
            glw.clearRect(clearleft, y, clearright - clearleft, h);
            if (inst)
            {
                inst.drawGL(glw);
            }
            else
            {
                glw.setTexture(this.runtime.layer_tex);
                glw.setOpacity(layer.opacity);
                glw.resetModelView();
                glw.translate(-halfw, -halfh);
                glw.updateModelView();
                glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
            }
            rcTex2.left = rcTex2.top = 0;
            rcTex2.right = rcTex2.bottom = 1;
            if (inst)
            {
                temp = rcTex.top;
                rcTex.top = rcTex.bottom;
                rcTex.bottom = temp;
            }
            fx_index = 1;
            other_fx_index = 0;
        }
        glw.setOpacity(1);
        var last = active_effect_types.length - 1;
        var post_draw = glw.programUsesCrossSampling(active_effect_types[last].shaderindex);
        var etindex = 0;
        for (i = 0, len = active_effect_types.length; i < len; i++)
        {
            if (!fx_tex[fx_index])
            {
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
            {
                glw.deleteTexture(fx_tex[fx_index]);
                fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
            }
            glw.switchProgram(active_effect_types[i].shaderindex);
            etindex = active_effect_types[i].index;
            if (glw.programIsAnimated(active_effect_types[i].shaderindex))
                this.runtime.redraw = true;
            if (i == 0 && !pre_draw)
            {
                glw.setRenderingToTexture(fx_tex[fx_index]);
                h = clearbottom - cleartop;
                y = (windowHeight - cleartop) - h;
                glw.clearRect(clearleft, y, clearright - clearleft, h);
                if (inst)
                {
                    glw.setProgramParameters(rendertarget,                  // backTex
                                             1.0 / inst.width,              // pixelWidth
                                             1.0 / inst.height,             // pixelHeight
                                             rcTex2.left, rcTex2.top,       // destStart
                                             rcTex2.right, rcTex2.bottom,   // destEnd
                                             layerScale,
                                             inst.effect_params[etindex]);  // fx params
                    inst.drawGL(glw);
                }
                else
                {
                    glw.setProgramParameters(rendertarget,                  // backTex
                                             1.0 / windowWidth,             // pixelWidth
                                             1.0 / windowHeight,            // pixelHeight
                                             0.0, 0.0,                      // destStart
                                             1.0, 1.0,                      // destEnd
                                             layerScale,
                                             layer ?                        // fx params
                                                layer.effect_params[etindex] :
                                                this.effect_params[etindex]);
                    glw.setTexture(layer ? this.runtime.layer_tex : this.runtime.layout_tex);
                    glw.resetModelView();
                    glw.translate(-halfw, -halfh);
                    glw.updateModelView();
                    glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
                }
                rcTex2.left = rcTex2.top = 0;
                rcTex2.right = rcTex2.bottom = 1;
                if (inst && !post_draw)
                {
                    temp = screenbottom;
                    screenbottom = screentop;
                    screentop = temp;
                }
            }
            else
            {
                glw.setProgramParameters(rendertarget,                      // backTex
                                         1.0 / windowWidth,                 // pixelWidth
                                         1.0 / windowHeight,                // pixelHeight
                                         rcTex2.left, rcTex2.top,           // destStart
                                         rcTex2.right, rcTex2.bottom,       // destEnd
                                         layerScale,
                                         inst ?                             // fx params
                                            inst.effect_params[etindex] :
                                            layer ?
                                                layer.effect_params[etindex] :
                                                this.effect_params[etindex]);
                if (i === last && !post_draw)
                {
                    if (inst)
                        glw.setBlend(inst.srcBlend, inst.destBlend);
                    else if (layer)
                        glw.setBlend(layer.srcBlend, layer.destBlend);
                    glw.setRenderingToTexture(rendertarget);
                }
                else
                {
                    glw.setRenderingToTexture(fx_tex[fx_index]);
                    h = clearbottom - cleartop;
                    y = (windowHeight - cleartop) - h;
                    glw.clearRect(clearleft, y, clearright - clearleft, h);
                }
                glw.setTexture(fx_tex[other_fx_index]);
                glw.resetModelView();
                glw.translate(-halfw, -halfh);
                glw.updateModelView();
                glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
                if (i === last && !post_draw)
                    glw.setTexture(null);
            }
            fx_index = (fx_index === 0 ? 1 : 0);
            other_fx_index = (fx_index === 0 ? 1 : 0);      // will be opposite to fx_index since it was just assigned
        }
        if (post_draw)
        {
            glw.switchProgram(0);
            if (inst)
                glw.setBlend(inst.srcBlend, inst.destBlend);
            else if (layer)
                glw.setBlend(layer.srcBlend, layer.destBlend);
            glw.setRenderingToTexture(rendertarget);
            glw.setTexture(fx_tex[other_fx_index]);
            glw.resetModelView();
            glw.translate(-halfw, -halfh);
            glw.updateModelView();
            if (inst && active_effect_types.length === 1 && !pre_draw)
                glw.quadTex(screenleft, screentop, screenright, screentop, screenright, screenbottom, screenleft, screenbottom, rcTex);
            else
                glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
            glw.setTexture(null);
        }
    };
    cr.layout = Layout;
    function Layer(layout, m)
    {
        this.layout = layout;
        this.runtime = layout.runtime;
        this.instances = [];        // running instances
        this.scale = 1.0;
        this.angle = 0;
        this.disableAngle = false;
        this.tmprect = new cr.rect(0, 0, 0, 0);
        this.tmpquad = new cr.quad();
        this.viewLeft = 0;
        this.viewRight = 0;
        this.viewTop = 0;
        this.viewBottom = 0;
        this.zindices_stale = false;
        this.name = m[0];
        this.index = m[1];
        this.visible = m[2];        // initially visible
        this.background_color = m[3];
        this.transparent = m[4];
        this.parallaxX = m[5];
        this.parallaxY = m[6];
        this.opacity = m[7];
        this.forceOwnTexture = m[8];
        this.zoomRate = m[9];
        this.blend_mode = m[10];
        this.effect_fallback = m[11];
        this.compositeOp = "source-over";
        this.srcBlend = 0;
        this.destBlend = 0;
        this.render_offscreen = false;
        var im = m[12];
        var i, len;
        this.initial_instances = [];
        for (i = 0, len = im.length; i < len; i++)
        {
            var inst = im[i];
            var type = this.runtime.types_by_index[inst[1]];
;
            if (!type.default_instance)
                type.default_instance = inst;
            this.initial_instances.push(inst);
        }
        this.effect_types = [];
        this.active_effect_types = [];
        this.effect_params = [];
        for (i = 0, len = m[13].length; i < len; i++)
        {
            this.effect_types.push({
                id: m[13][i][0],
                name: m[13][i][1],
                shaderindex: -1,
                active: true,
                index: i
            });
            this.effect_params.push(m[13][i][2].slice(0));
        }
        this.updateActiveEffects();
        this.rcTex = new cr.rect(0, 0, 1, 1);
        this.rcTex2 = new cr.rect(0, 0, 1, 1);
    };
    Layer.prototype.updateActiveEffects = function ()
    {
        this.active_effect_types.length = 0;
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.active)
                this.active_effect_types.push(et);
        }
    };
    Layer.prototype.getEffectByName = function (name_)
    {
        var i, len, et;
        for (i = 0, len = this.effect_types.length; i < len; i++)
        {
            et = this.effect_types[i];
            if (et.name === name_)
                return et;
        }
        return null;
    };
    Layer.prototype.createInitialInstances = function ()
    {
        var i, k, len, inst;
        for (i = 0, k = 0, len = this.initial_instances.length; i < len; i++)
        {
            inst = this.runtime.createInstanceFromInit(this.initial_instances[i], this, true);
            if (inst && !inst.type.global)
            {
                this.initial_instances[k] = this.initial_instances[i];
                k++;
            }
        }
        this.initial_instances.length = k;
        if (!this.runtime.glwrap && this.effect_types.length)   // no WebGL renderer and shaders used
            this.blend_mode = this.effect_fallback;             // use fallback blend mode
        this.compositeOp = cr.effectToCompositeOp(this.blend_mode);
        if (this.runtime.gl)
            cr.setGLBlend(this, this.blend_mode, this.runtime.gl);
    };
    Layer.prototype.updateZIndices = function ()
    {
        if (!this.zindices_stale)
            return;
        var i, len;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
;
;
            this.instances[i].zindex = i;
        }
        this.zindices_stale = false;
    };
    Layer.prototype.getScale = function ()
    {
        return this.getNormalScale() * this.runtime.aspect_scale;
    };
    Layer.prototype.getNormalScale = function ()
    {
        return ((this.scale * this.layout.scale) - 1) * this.zoomRate + 1;
    };
    Layer.prototype.getAngle = function ()
    {
        if (this.disableAngle)
            return 0;
        return cr.clamp_angle(this.layout.angle + this.angle);
    };
    Layer.prototype.draw = function (ctx)
    {
        this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.blend_mode !== 0);
        var layer_canvas = this.runtime.canvas;
        var layer_ctx = ctx;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        if (this.render_offscreen)
        {
            if (!this.runtime.layer_canvas)
            {
                this.runtime.layer_canvas = document.createElement("canvas");
;
                layer_canvas = this.runtime.layer_canvas;
                layer_canvas.width = this.runtime.width;
                layer_canvas.height = this.runtime.height;
                this.runtime.layer_ctx = layer_canvas.getContext("2d");
;
            }
            layer_canvas = this.runtime.layer_canvas;
            layer_ctx = this.runtime.layer_ctx;
            if (layer_canvas.width !== this.runtime.width)
                layer_canvas.width = this.runtime.width;
            if (layer_canvas.height !== this.runtime.height)
                layer_canvas.height = this.runtime.height;
            if (this.transparent)
                layer_ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
        }
        if (!this.transparent)
        {
            layer_ctx.fillStyle = "rgb(" + this.background_color[0] + "," + this.background_color[1] + "," + this.background_color[2] + ")";
            layer_ctx.fillRect(0, 0, this.runtime.width, this.runtime.height);
        }
        layer_ctx.save();
        this.disableAngle = true;
        var px = this.canvasToLayer(0, 0, true);
        var py = this.canvasToLayer(0, 0, false);
        this.disableAngle = false;
        if (this.runtime.pixel_rounding)
        {
            px = (px + 0.5) | 0;
            py = (py + 0.5) | 0;
        }
        this.rotateViewport(px, py, layer_ctx);
        var myscale = this.getScale();
        layer_ctx.scale(myscale, myscale);
        layer_ctx.translate(-px, -py);
        var i, len, inst, bbox;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
            inst = this.instances[i];
            if (!inst.visible || inst.width === 0 || inst.height === 0)
                continue;
            inst.update_bbox();
            bbox = inst.bbox;
            if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
                continue;
            layer_ctx.globalCompositeOperation = inst.compositeOp;
            inst.draw(layer_ctx);
        }
        layer_ctx.restore();
        if (this.render_offscreen)
        {
            ctx.globalCompositeOperation = this.compositeOp;
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(layer_canvas, 0, 0);
        }
    };
    Layer.prototype.rotateViewport = function (px, py, ctx)
    {
        var myscale = this.getScale();
        this.viewLeft = px;
        this.viewTop = py;
        this.viewRight = px + (this.runtime.width * (1 / myscale));
        this.viewBottom = py + (this.runtime.height * (1 / myscale));
        var myAngle = this.getAngle();
        if (myAngle !== 0)
        {
            if (ctx)
            {
                ctx.translate(this.runtime.width / 2, this.runtime.height / 2);
                ctx.rotate(-myAngle);
                ctx.translate(this.runtime.width / -2, this.runtime.height / -2);
            }
            this.tmprect.set(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom);
            this.tmprect.offset((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
            this.tmpquad.set_from_rotated_rect(this.tmprect, myAngle);
            this.tmpquad.bounding_box(this.tmprect);
            this.tmprect.offset((this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2);
            this.viewLeft = this.tmprect.left;
            this.viewTop = this.tmprect.top;
            this.viewRight = this.tmprect.right;
            this.viewBottom = this.tmprect.bottom;
        }
    }
    Layer.prototype.drawGL = function (glw)
    {
        var windowWidth = this.runtime.width;
        var windowHeight = this.runtime.height;
        var shaderindex = 0;
        var etindex = 0;
        this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.active_effect_types.length > 0 || this.blend_mode !== 0);
        if (this.render_offscreen)
        {
            if (!this.runtime.layer_tex)
            {
                this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            if (this.runtime.layer_tex.c2width !== this.runtime.width || this.runtime.layer_tex.c2height !== this.runtime.height)
            {
                glw.deleteTexture(this.runtime.layer_tex);
                this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
            }
            glw.setRenderingToTexture(this.runtime.layer_tex);
            if (this.transparent)
                glw.clear(0, 0, 0, 0);
        }
        if (!this.transparent)
        {
            glw.clear(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1);
        }
        this.disableAngle = true;
        var px = this.canvasToLayer(0, 0, true);
        var py = this.canvasToLayer(0, 0, false);
        this.disableAngle = false;
        if (this.runtime.pixel_rounding)
        {
            px = (px + 0.5) | 0;
            py = (py + 0.5) | 0;
        }
        this.rotateViewport(px, py, null);
        var myscale = this.getScale();
        glw.resetModelView();
        glw.scale(myscale, myscale);
        glw.rotateZ(-this.getAngle());
        glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
        glw.updateModelView();
        var i, len, inst, bbox;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
            inst = this.instances[i];
            if (!inst.visible || inst.width === 0 || inst.height === 0)
                continue;
            inst.update_bbox();
            bbox = inst.bbox;
            if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
                continue;
            if (inst.uses_shaders)
            {
                shaderindex = inst.active_effect_types[0].shaderindex;
                etindex = inst.active_effect_types[0].index;
                if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) &&
                    !glw.programExtendsBox(shaderindex) && ((!inst.angle && !inst.layer.getAngle()) || !glw.programUsesDest(shaderindex)) &&
                    inst.opacity === 1 && !inst.type.plugin.must_predraw)
                {
                    glw.switchProgram(shaderindex);
                    glw.setBlend(inst.srcBlend, inst.destBlend);
                    if (glw.programIsAnimated(shaderindex))
                        this.runtime.redraw = true;
                    var destStartX = 0, destStartY = 0, destEndX = 0, destEndY = 0;
                    if (glw.programUsesDest(shaderindex))
                    {
                        var bbox = inst.bbox;
                        var screenleft = this.layerToCanvas(bbox.left, bbox.top, true);
                        var screentop = this.layerToCanvas(bbox.left, bbox.top, false);
                        var screenright = this.layerToCanvas(bbox.right, bbox.bottom, true);
                        var screenbottom = this.layerToCanvas(bbox.right, bbox.bottom, false);
                        destStartX = screenleft / windowWidth;
                        destStartY = 1 - screentop / windowHeight;
                        destEndX = screenright / windowWidth;
                        destEndY = 1 - screenbottom / windowHeight;
                    }
                    glw.setProgramParameters(this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget(), // backTex
                                             1.0 / inst.width,          // pixelWidth
                                             1.0 / inst.height,         // pixelHeight
                                             destStartX, destStartY,
                                             destEndX, destEndY,
                                             this.getScale(),
                                             inst.effect_params[etindex]);
                    inst.drawGL(glw);
                }
                else
                {
                    this.layout.renderEffectChain(glw, this, inst, this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget());
                    glw.resetModelView();
                    glw.scale(myscale, myscale);
                    glw.rotateZ(-this.getAngle());
                    glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
                    glw.updateModelView();
                }
            }
            else
            {
                glw.switchProgram(0);       // un-set any previously set shader
                glw.setBlend(inst.srcBlend, inst.destBlend);
                inst.drawGL(glw);
            }
        }
        if (this.render_offscreen)
        {
            shaderindex = this.active_effect_types.length ? this.active_effect_types[0].shaderindex : 0;
            etindex = this.active_effect_types.length ? this.active_effect_types[0].index : 0;
            if (this.active_effect_types.length === 0 || (this.active_effect_types.length === 1 &&
                !glw.programUsesCrossSampling(shaderindex) && this.opacity === 1))
            {
                if (this.active_effect_types.length === 1)
                {
                    glw.switchProgram(shaderindex);
                    glw.setProgramParameters(this.layout.getRenderTarget(),     // backTex
                                             1.0 / this.runtime.width,          // pixelWidth
                                             1.0 / this.runtime.height,         // pixelHeight
                                             0.0, 0.0,                          // destStart
                                             1.0, 1.0,                          // destEnd
                                             this.getScale(),                   // layerScale
                                             this.effect_params[etindex]);      // fx parameters
                    if (glw.programIsAnimated(shaderindex))
                        this.runtime.redraw = true;
                }
                else
                    glw.switchProgram(0);
                glw.setRenderingToTexture(this.layout.getRenderTarget());
                glw.setOpacity(this.opacity);
                glw.setTexture(this.runtime.layer_tex);
                glw.setBlend(this.srcBlend, this.destBlend);
                glw.resetModelView();
                glw.updateModelView();
                var halfw = this.runtime.width / 2;
                var halfh = this.runtime.height / 2;
                glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
                glw.setTexture(null);
            }
            else
            {
                this.layout.renderEffectChain(glw, this, null, this.layout.getRenderTarget());
            }
        }
    };
    Layer.prototype.canvasToLayer = function (ptx, pty, getx)
    {
        var isiOSRetina = (!this.runtime.isDomFree && this.runtime.useiOSRetina && this.runtime.isiOS);
        var multiplier = this.runtime.devicePixelRatio;
        if (isiOSRetina && this.runtime.fullscreen_mode > 0)
        {
            ptx *= multiplier;
            pty *= multiplier;
        }
        var ox = (this.runtime.original_width / 2);
        var oy = (this.runtime.original_height / 2);
        var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
        var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
        var invScale = 1 / this.getScale();
        x -= (this.runtime.width * invScale) / 2;
        y -= (this.runtime.height * invScale) / 2;
        x += ptx * invScale;
        y += pty * invScale;
        var a = this.getAngle();
        if (a !== 0)
        {
            x -= this.layout.scrollX;
            y -= this.layout.scrollY;
            var cosa = Math.cos(a);
            var sina = Math.sin(a);
            var x_temp = (x * cosa) - (y * sina);
            y = (y * cosa) + (x * sina);
            x = x_temp;
            x += this.layout.scrollX;
            y += this.layout.scrollY;
        }
        return getx ? x : y;
    };
    Layer.prototype.layerToCanvas = function (ptx, pty, getx)
    {
        var a = this.getAngle();
        if (a !== 0)
        {
            ptx -= this.layout.scrollX;
            pty -= this.layout.scrollY;
            var cosa = Math.cos(-a);
            var sina = Math.sin(-a);
            var x_temp = (ptx * cosa) - (pty * sina);
            pty = (pty * cosa) + (ptx * sina);
            ptx = x_temp;
            ptx += this.layout.scrollX;
            pty += this.layout.scrollY;
        }
        var ox = (this.runtime.original_width / 2);
        var oy = (this.runtime.original_height / 2);
        var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
        var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
        var invScale = 1 / this.getScale();
        x -= (this.runtime.width * invScale) / 2;
        y -= (this.runtime.height * invScale) / 2;
        x = (ptx - x) / invScale;
        y = (pty - y) / invScale;
        var isiOSRetina = (!this.runtime.isDomFree && this.runtime.useiOSRetina && this.runtime.isiOS);
        var multiplier = this.runtime.devicePixelRatio;
        if (isiOSRetina && this.runtime.fullscreen_mode > 0)
        {
            x /= multiplier;
            y /= multiplier;
        }
        return getx ? x : y;
    };
    cr.layer = Layer;
}());
;
(function()
{
    var allUniqueSolModifiers = [];
    function testSolsMatch(arr1, arr2)
    {
        if (arr1.length !== arr2.length)
            return false;
        var i, len;
        for (i = 0, len = arr1.length; i < len; i++)
        {
            if (arr1[i] != arr2[i])
                return false;
        }
        return true;
    };
    function solArraySorter(t1, t2)
    {
        return t1.index - t2.index;
    };
    function findMatchingSolModifier(arr)
    {
        var i, len, u;
        arr.sort(solArraySorter);       // so testSolsMatch compares in same order
        for (i = 0, len = allUniqueSolModifiers.length; i < len; i++)
        {
            u = allUniqueSolModifiers[i];
            if (testSolsMatch(arr, u))
                return u;
        }
        allUniqueSolModifiers.push(arr);
        return arr;
    };
    function EventSheet(runtime, m)
    {
        this.runtime = runtime;
        this.triggers = {};
        this.fasttriggers = {};
        this.hasRun = false;
        this.includes = new cr.ObjectSet(); // all event sheets included by this sheet, at first-level indirection only
        this.name = m[0];
        var em = m[1];      // events model
        this.events = [];       // triggers won't make it to this array
        var i, len;
        for (i = 0, len = em.length; i < len; i++)
            this.init_event(em[i], null, this.events);
    };
    EventSheet.prototype.toString = function ()
    {
        return this.name;
    };
    EventSheet.prototype.init_event = function (m, parent, nontriggers)
    {
        switch (m[0]) {
        case 0: // event block
        {
            var block = new cr.eventblock(this, parent, m);
            cr.seal(block);
            if (block.orblock)
            {
                nontriggers.push(block);
                var i, len;
                for (i = 0, len = block.conditions.length; i < len; i++)
                {
                    if (block.conditions[i].trigger)
                        this.init_trigger(block, i);
                }
            }
            else
            {
                if (block.is_trigger())
                    this.init_trigger(block, 0);
                else
                    nontriggers.push(block);
            }
            break;
        }
        case 1: // variable
        {
            var v = new cr.eventvariable(this, parent, m);
            cr.seal(v);
            nontriggers.push(v);
            break;
        }
        case 2: // include
        {
            var inc = new cr.eventinclude(this, parent, m);
            cr.seal(inc);
            nontriggers.push(inc);
            break;
        }
        default:
;
        }
    };
    EventSheet.prototype.postInit = function ()
    {
        var i, len;
        for (i = 0, len = this.events.length; i < len; i++)
        {
            this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block);
        }
    };
    EventSheet.prototype.run = function ()
    {
        this.hasRun = true;
        this.runtime.isRunningEvents = true;
        var i, len;
        for (i = 0, len = this.events.length; i < len; i++)
        {
            var ev = this.events[i];
            ev.run();
            this.runtime.clearSol(ev.solModifiers);
            if (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length)
                this.runtime.ClearDeathRow();
        }
        this.runtime.isRunningEvents = false;
    };
    EventSheet.prototype.init_trigger = function (trig, index)
    {
        if (!trig.orblock)
            this.runtime.triggers_to_postinit.push(trig);   // needs to be postInit'd later
        var i, len;
        var cnd = trig.conditions[index];
        var type_name;
        if (cnd.type)
            type_name = cnd.type.name;
        else
            type_name = "system";
        var fasttrigger = cnd.fasttrigger;
        var triggers = (fasttrigger ? this.fasttriggers : this.triggers);
        if (!triggers[type_name])
            triggers[type_name] = [];
        var obj_entry = triggers[type_name];
        var method = cnd.func;
        if (fasttrigger)
        {
            if (!cnd.parameters.length)             // no parameters
                return;
            var firstparam = cnd.parameters[0];
            if (firstparam.type !== 1 ||            // not a string param
                firstparam.expression.type !== 2)   // not a string literal node
            {
                return;
            }
            var fastevs;
            var firstvalue = firstparam.expression.value.toLowerCase();
            var i, len;
            for (i = 0, len = obj_entry.length; i < len; i++)
            {
                if (obj_entry[i].method == method)
                {
                    fastevs = obj_entry[i].evs;
                    if (!fastevs[firstvalue])
                        fastevs[firstvalue] = [[trig, index]];
                    else
                        fastevs[firstvalue].push([trig, index]);
                    return;
                }
            }
            fastevs = {};
            fastevs[firstvalue] = [[trig, index]];
            obj_entry.push({ method: method, evs: fastevs });
        }
        else
        {
            for (i = 0, len = obj_entry.length; i < len; i++)
            {
                if (obj_entry[i].method == method)
                {
                    obj_entry[i].evs.push([trig, index]);
                    return;
                }
            }
            obj_entry.push({ method: method, evs: [[trig, index]]});
        }
    };
    cr.eventsheet = EventSheet;
    function Selection(type)
    {
        this.type = type;
        this.instances = [];        // subset of picked instances
        this.else_instances = [];   // subset of unpicked instances
        this.select_all = true;
    };
    Selection.prototype.hasObjects = function ()
    {
        if (this.select_all)
            return this.type.instances.length;
        else
            return this.instances.length;
    };
    Selection.prototype.getObjects = function ()
    {
        if (this.select_all)
            return this.type.instances;
        else
            return this.instances;
    };
    Selection.prototype.ensure_picked = function (inst)
    {
        var orblock = inst.runtime.getCurrentEventStack().current_event.orblock;
        if (this.select_all)
        {
            this.select_all = false;
            if (orblock)
            {
                cr.shallowAssignArray(this.else_instances, inst.type.instances);
                cr.arrayFindRemove(this.else_instances, inst);
            }
            this.instances.length = 1;
            this.instances[0] = inst;
        }
        else
        {
            if (orblock)
            {
                var i = this.else_instances.indexOf(inst);
                if (i !== -1)
                {
                    this.instances.push(this.else_instances[i]);
                    this.else_instances.splice(i, 1);
                }
            }
            else
            {
                if (this.instances.indexOf(inst) === -1)
                    this.instances.push(inst);
            }
        }
    };
    Selection.prototype.pick_one = function (inst)
    {
        if (!inst)
            return;
        if (inst.runtime.getCurrentEventStack().current_event.orblock)
        {
            if (this.select_all)
            {
                this.instances.length = 0;
                cr.shallowAssignArray(this.else_instances, inst.type.instances);
                this.select_all = false;
            }
            var i = this.else_instances.indexOf(inst);
            if (i !== -1)
            {
                this.instances.push(this.else_instances[i]);
                this.else_instances.splice(i, 1);
            }
        }
        else
        {
            this.select_all = false;
            this.instances.length = 1;
            this.instances[0] = inst;
        }
    };
    cr.selection = Selection;
    function EventBlock(sheet, parent, m)
    {
        this.sheet = sheet;
        this.parent = parent;
        this.runtime = sheet.runtime;
        this.solModifiers = [];
        this.solModifiersIncludingParents = [];
        this.solWriterAfterCnds = false;    // block does not change SOL after running its conditions
        this.group = false;                 // is group of events
        this.initially_activated = false;   // if a group, is active on startup
        this.toplevelevent = false;         // is an event block parented only by a top-level group
        this.toplevelgroup = false;         // is parented only by other groups or is top-level (i.e. not in a subevent)
        this.has_else_block = false;        // is followed by else
;
        this.conditions = [];
        this.actions = [];
        this.subevents = [];
        if (m[1])
        {
            this.group_name = m[1][1].toLowerCase();
            this.group = true;
            this.initially_activated = !!m[1][0];
            this.runtime.allGroups.push(this);
            this.runtime.activeGroups[(/*this.sheet.name + "|" + */this.group_name).toLowerCase()] = this.initially_activated;
        }
        else
        {
            this.group_name = "";
            this.group = false;
            this.initially_activated = false;
        }
        this.orblock = m[2];
        var i, len;
        var cm = m[3];
        for (i = 0, len = cm.length; i < len; i++)
        {
            var cnd = new cr.condition(this, cm[i]);
            cr.seal(cnd);
            this.conditions.push(cnd);
            /*
            if (cnd.is_logical())
                this.is_logical = true;
            if (cnd.type && !cnd.type.plugin.singleglobal && this.cndReferences.indexOf(cnd.type) === -1)
                this.cndReferences.push(cnd.type);
            */
            this.addSolModifier(cnd.type);
        }
        var am = m[4];
        for (i = 0, len = am.length; i < len; i++)
        {
            var act = new cr.action(this, am[i]);
            cr.seal(act);
            this.actions.push(act);
        }
        if (m.length === 6)
        {
            var em = m[5];
            for (i = 0, len = em.length; i < len; i++)
                this.sheet.init_event(em[i], this, this.subevents);
        }
        this.is_else_block = false;
        if (this.conditions.length)
            this.is_else_block = (this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else);
    };
    EventBlock.prototype.postInit = function (hasElse/*, prevBlock_*/)
    {
        var i, len;
        var p = this.parent;
        if (this.group)
        {
            this.toplevelgroup = true;
            while (p)
            {
                if (!p.group)
                {
                    this.toplevelgroup = false;
                    break;
                }
                p = p.parent;
            }
        }
        this.toplevelevent = !this.is_trigger() && (!this.parent || (this.parent.group && this.parent.toplevelgroup));
        this.has_else_block = !!hasElse;
        this.solModifiersIncludingParents = this.solModifiers.slice(0);
        p = this.parent;
        while (p)
        {
            for (i = 0, len = p.solModifiers.length; i < len; i++)
                this.addParentSolModifier(p.solModifiers[i]);
            p = p.parent;
        }
        this.solModifiers = findMatchingSolModifier(this.solModifiers);
        this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
        var i, len/*, s*/;
        for (i = 0, len = this.conditions.length; i < len; i++)
            this.conditions[i].postInit();
        for (i = 0, len = this.actions.length; i < len; i++)
            this.actions[i].postInit();
        for (i = 0, len = this.subevents.length; i < len; i++)
        {
            this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block);
        }
        /*
        if (this.is_else_block && this.prev_block)
        {
            for (i = 0, len = this.prev_block.solModifiers.length; i < len; i++)
            {
                s = this.prev_block.solModifiers[i];
                if (this.solModifiers.indexOf(s) === -1)
                    this.solModifiers.push(s);
            }
        }
        */
    }
    EventBlock.prototype.addSolModifier = function (type)
    {
        if (!type)
            return;
        if (this.solModifiers.indexOf(type) === -1)
            this.solModifiers.push(type);
    };
    EventBlock.prototype.addParentSolModifier = function (type)
    {
        if (!type)
            return;
        if (this.solModifiersIncludingParents.indexOf(type) === -1)
            this.solModifiersIncludingParents.push(type);
    };
    EventBlock.prototype.setSolWriterAfterCnds = function ()
    {
        this.solWriterAfterCnds = true;
        if (this.parent)
            this.parent.setSolWriterAfterCnds();
    };
    EventBlock.prototype.is_trigger = function ()
    {
        if (!this.conditions.length)    // no conditions
            return false;
        else
            return this.conditions[0].trigger;
    };
    EventBlock.prototype.run = function ()
    {
        var i, len, any_true = false/*, bail = false*/;
        var evinfo = this.runtime.getCurrentEventStack();
        evinfo.current_event = this;
        if (!this.is_else_block)
            evinfo.else_branch_ran = false;
        if (this.orblock)
        {
            for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
            {
                if (this.conditions[evinfo.cndindex].trigger)       // skip triggers when running OR block
                    continue;
                if (this.conditions[evinfo.cndindex].run())         // make sure all conditions run and run if any were true
                    any_true = true;
            }
            evinfo.last_event_true = any_true;
            if (any_true)
                this.run_actions_and_subevents();
        }
        else
        {
            for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
            {
                if (!this.conditions[evinfo.cndindex].run())    // condition failed
                {
                    evinfo.last_event_true = false;
                    return;                                     // bail out now
                }
            }
            evinfo.last_event_true = true;
            this.run_actions_and_subevents();
        }
        if (evinfo.last_event_true && this.has_else_block)
            evinfo.else_branch_ran = true;
        if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
            this.runtime.ClearDeathRow();
    };
    EventBlock.prototype.run_orblocktrigger = function (index)
    {
        var evinfo = this.runtime.getCurrentEventStack();
        evinfo.current_event = this;
        if (this.conditions[index].run())
        {
            this.run_actions_and_subevents();
        }
    };
    EventBlock.prototype.run_actions_and_subevents = function ()
    {
        var evinfo = this.runtime.getCurrentEventStack();
        var len;
        for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
        {
            if (this.actions[evinfo.actindex].run())
                return;
        }
        this.run_subevents();
    };
    EventBlock.prototype.resume_actions_and_subevents = function ()
    {
        var evinfo = this.runtime.getCurrentEventStack();
        var len;
        for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
        {
            if (this.actions[evinfo.actindex].run())
                return;
        }
        this.run_subevents();
    };
    EventBlock.prototype.run_subevents = function ()
    {
        if (!this.subevents.length)
            return;
        var i, len, subev, pushpop/*, skipped_pop = false, pop_modifiers = null*/;
        var last = this.subevents.length - 1;
        this.runtime.pushEventStack(this);
        if (this.solWriterAfterCnds)
        {
            for (i = 0, len = this.subevents.length; i < len; i++)
            {
                subev = this.subevents[i];
                pushpop = (!this.toplevelgroup || (!this.group && i < last));
                if (pushpop)
                    this.runtime.pushCopySol(subev.solModifiers);
                subev.run();
                if (pushpop)
                    this.runtime.popSol(subev.solModifiers);
                else
                    this.runtime.clearSol(subev.solModifiers);
            }
        }
        else
        {
            for (i = 0, len = this.subevents.length; i < len; i++)
            {
                this.subevents[i].run();
            }
        }
        this.runtime.popEventStack();
    };
    EventBlock.prototype.run_pretrigger = function ()
    {
        var evinfo = this.runtime.getCurrentEventStack();
        evinfo.current_event = this;
        var any_true = false;
        var i, len;
        for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
        {
;
            if (this.conditions[evinfo.cndindex].run())
                any_true = true;
            else if (!this.orblock)         // condition failed (let OR blocks run all conditions anyway)
                return false;               // bail out
        }
        return this.orblock ? any_true : true;
    };
    EventBlock.prototype.retrigger = function ()
    {
        this.runtime.execcount++;
        var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
        var len;
        var evinfo = this.runtime.pushEventStack(this);
        if (!this.orblock)
        {
            for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
            {
                if (!this.conditions[evinfo.cndindex].run())    // condition failed
                {
                    this.runtime.popEventStack();               // moving up level of recursion
                    return false;                               // bail out
                }
            }
        }
        this.run_actions_and_subevents();
        this.runtime.popEventStack();
        return true;        // ran an iteration
    };
    cr.eventblock = EventBlock;
    function Condition(block, m)
    {
        this.block = block;
        this.sheet = block.sheet;
        this.runtime = block.runtime;
        this.parameters = [];
        this.results = [];
        this.extra = {};        // for plugins to stow away some custom info
        this.func = m[1];
;
        this.trigger = (m[3] > 0);
        this.fasttrigger = (m[3] === 2);
        this.looping = m[4];
        this.inverted = m[5];
        this.isstatic = m[6];
        if (m[0] === -1)        // system object
        {
            this.type = null;
            this.run = this.run_system;
            this.behaviortype = null;
            this.beh_index = -1;
        }
        else
        {
            this.type = this.runtime.types_by_index[m[0]];
;
            if (this.isstatic)
                this.run = this.run_static;
            else
                this.run = this.run_object;
            if (m[2])
            {
                this.behaviortype = this.type.getBehaviorByName(m[2]);
;
                this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
            }
            else
            {
                this.behaviortype = null;
                this.beh_index = -1;
            }
            if (this.block.parent)
                this.block.parent.setSolWriterAfterCnds();
        }
        if (this.fasttrigger)
            this.run = this.run_true;
        if (m.length === 8)
        {
            var i, len;
            var em = m[7];
            for (i = 0, len = em.length; i < len; i++)
            {
                var param = new cr.parameter(this, em[i]);
                cr.seal(param);
                this.parameters.push(param);
            }
            this.results.length = em.length;
        }
    };
    Condition.prototype.postInit = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.parameters[i].postInit();
    };
    /*
    Condition.prototype.is_logical = function ()
    {
        return !this.type || this.type.plugin.singleglobal;
    };
    */
    Condition.prototype.run_true = function ()
    {
        return true;
    };
    Condition.prototype.run_system = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.results[i] = this.parameters[i].get();
        return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted);
    };
    Condition.prototype.run_static = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.results[i] = this.parameters[i].get();
        return this.func.apply(this.type, this.results);
    };
    Condition.prototype.run_object = function ()
    {
        var i, j, leni, lenj, ret, inst;
        var sol = this.type.getCurrentSol();
        var is_orblock = this.block.orblock && !this.trigger;       // triggers in OR blocks need to work normally
        var offset = 0;
        if (sol.select_all) {
            sol.instances.length = 0;       // clear contents
            sol.else_instances.length = 0;
            for (i = 0, leni = this.type.instances.length; i < leni; i++)
            {
                inst = this.type.instances[i];
;
                for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                    this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
                if (this.beh_index > -1)
                {
                    if (this.type.is_family)
                    {
                        offset = inst.type.family_beh_map[this.type.family_index];
                    }
                    ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
                }
                else
                    ret = this.func.apply(inst, this.results);
                if (cr.xor(ret, this.inverted))
                    sol.instances.push(inst);
                else if (is_orblock)                    // in OR blocks, keep the instances not meeting the condition for subsequent testing
                    sol.else_instances.push(inst);
            }
            if (this.type.finish)
                this.type.finish(true);
            sol.select_all = false;
            return sol.hasObjects();
        }
        else {
            var k = 0;
            var arr = (is_orblock ? sol.else_instances : sol.instances);
            var any_true = false;
            for (i = 0, leni = arr.length; i < leni; i++)
            {
                inst = arr[i];
;
                for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                    this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
                if (this.beh_index > -1)
                {
                    if (this.type.is_family)
                    {
                        offset = inst.type.family_beh_map[this.type.family_index];
                    }
                    ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
                }
                else
                    ret = this.func.apply(inst, this.results);
                if (cr.xor(ret, this.inverted))
                {
                    any_true = true;
                    if (is_orblock)
                    {
                        sol.instances.push(inst);
                    }
                    else
                    {
                        arr[k] = inst;
                        k++;
                    }
                }
                else
                {
                    if (is_orblock)
                    {
                        arr[k] = inst;
                        k++;
                    }
                }
            }
            arr.length = k;
            var pick_in_finish = any_true;      // don't pick in finish() if we're only doing the logic test below
            if (is_orblock && !any_true)
            {
                for (i = 0, leni = sol.instances.length; i < leni; i++)
                {
                    inst = sol.instances[i];
                    for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                        this.results[j] = this.parameters[j].get(i);
                    if (this.beh_index > -1)
                        ret = this.func.apply(inst.behavior_insts[this.beh_index], this.results);
                    else
                        ret = this.func.apply(inst, this.results);
                    if (cr.xor(ret, this.inverted))
                    {
                        any_true = true;
                        break;      // got our flag, don't need to test any more
                    }
                }
            }
            if (this.type.finish)
                this.type.finish(pick_in_finish || is_orblock);
            return is_orblock ? any_true : sol.hasObjects();
        }
    };
    cr.condition = Condition;
    function Action(block, m)
    {
        this.block = block;
        this.sheet = block.sheet;
        this.runtime = block.runtime;
        this.parameters = [];
        this.results = [];
        this.extra = {};        // for plugins to stow away some custom info
        this.func = m[1];
;
        if (m[0] === -1)    // system
        {
            this.type = null;
            this.run = this.run_system;
            this.behaviortype = null;
            this.beh_index = -1;
        }
        else
        {
            this.type = this.runtime.types_by_index[m[0]];
;
            this.run = this.run_object;
            if (m[2])
            {
                this.behaviortype = this.type.getBehaviorByName(m[2]);
;
                this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
            }
            else
            {
                this.behaviortype = null;
                this.beh_index = -1;
            }
        }
        if (m.length === 4)
        {
            var i, len;
            var em = m[3];
            for (i = 0, len = em.length; i < len; i++)
            {
                var param = new cr.parameter(this, em[i]);
                cr.seal(param);
                this.parameters.push(param);
            }
            this.results.length = em.length;
        }
    };
    Action.prototype.postInit = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.parameters[i].postInit();
    };
    Action.prototype.run_system = function ()
    {
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
            this.results[i] = this.parameters[i].get();
        return this.func.apply(this.runtime.system, this.results);
    };
    Action.prototype.run_object = function ()
    {
        var instances = this.type.getCurrentSol().getObjects();
        var i, j, leni, lenj, inst;
        for (i = 0, leni = instances.length; i < leni; i++)
        {
            inst = instances[i];
            for (j = 0, lenj = this.parameters.length; j < lenj; j++)
                this.results[j] = this.parameters[j].get(i);    // pass i to use as default SOL index
            if (this.beh_index > -1)
            {
                var offset = 0;
                if (this.type.is_family)
                {
                    offset = inst.type.family_beh_map[this.type.family_index];
                }
                this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
            }
            else
                this.func.apply(inst, this.results);
        }
        return false;
    };
    cr.action = Action;
    var tempValues = [];
    var tempValuesPtr = -1;
    function Parameter(owner, m)
    {
        this.owner = owner;
        this.block = owner.block;
        this.sheet = owner.sheet;
        this.runtime = owner.runtime;
        this.type = m[0];
        this.expression = null;
        this.solindex = 0;
        this.combosel = 0;
        this.layout = null;
        this.key = 0;
        this.object = null;
        this.index = 0;
        this.varname = null;
        this.eventvar = null;
        this.fileinfo = null;
        this.subparams = null;
        this.variadicret = null;
        var i, len, param;
        switch (m[0])
        {
            case 0:     // number
            case 7:     // any
                this.expression = new cr.expNode(this, m[1]);
                this.solindex = 0;
                this.get = this.get_exp;
                break;
            case 1:     // string
                this.expression = new cr.expNode(this, m[1]);
                this.solindex = 0;
                this.get = this.get_exp_str;
                break;
            case 5:     // layer
                this.expression = new cr.expNode(this, m[1]);
                this.solindex = 0;
                this.get = this.get_layer;
                break;
            case 3:     // combo
            case 8:     // cmp
                this.combosel = m[1];
                this.get = this.get_combosel;
                break;
            case 6:     // layout
                this.layout = this.runtime.layouts[m[1]];
;
                this.get = this.get_layout;
                break;
            case 9:     // keyb
                this.key = m[1];
                this.get = this.get_key;
                break;
            case 4:     // object
                this.object = this.runtime.types_by_index[m[1]];
;
                this.get = this.get_object;
                this.block.addSolModifier(this.object);
                if (this.owner instanceof cr.action)
                    this.block.setSolWriterAfterCnds();
                else if (this.block.parent)
                    this.block.parent.setSolWriterAfterCnds();
                break;
            case 10:    // instvar
                this.index = m[1];
                if (owner.type.is_family)
                    this.get = this.get_familyvar;
                else
                    this.get = this.get_instvar;
                break;
            case 11:    // eventvar
                this.varname = m[1];
                this.eventvar = null;
                this.get = this.get_eventvar;
                break;
            case 2:     // audiofile    ["name", ismusic]
            case 12:    // fileinfo     "name"
                this.fileinfo = m[1];
                this.get = this.get_audiofile;
                break;
            case 13:    // variadic
                this.get = this.get_variadic;
                this.subparams = [];
                this.variadicret = [];
                for (i = 1, len = m.length; i < len; i++)
                {
                    param = new cr.parameter(this.owner, m[i]);
                    cr.seal(param);
                    this.subparams.push(param);
                    this.variadicret.push(0);
                }
                break;
            default:
;
        }
    };
    Parameter.prototype.postInit = function ()
    {
        if (this.type === 11)   // eventvar
        {
            this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent);
;
        }
        if (this.expression)
            this.expression.postInit();
    };
    Parameter.prototype.pushTempValue = function ()
    {
        tempValuesPtr++;
        if (tempValues.length === tempValuesPtr)
            tempValues.push(new cr.expvalue());
        return tempValues[tempValuesPtr];
    };
    Parameter.prototype.popTempValue = function ()
    {
        tempValuesPtr--;
    };
    Parameter.prototype.get_exp = function (solindex)
    {
        this.solindex = solindex || 0;   // default SOL index to use
        var temp = this.pushTempValue();
        this.expression.get(temp);
        this.popTempValue();
        return temp.data;               // return actual JS value, not expvalue
    };
    Parameter.prototype.get_exp_str = function (solindex)
    {
        this.solindex = solindex || 0;   // default SOL index to use
        var temp = this.pushTempValue();
        this.expression.get(temp);
        this.popTempValue();
        if (cr.is_string(temp.data))
            return temp.data;
        else
            return "";
    };
    Parameter.prototype.get_object = function ()
    {
        return this.object;
    };
    Parameter.prototype.get_combosel = function ()
    {
        return this.combosel;
    };
    Parameter.prototype.get_layer = function (solindex)
    {
        this.solindex = solindex || 0;   // default SOL index to use
        var temp = this.pushTempValue();
        this.expression.get(temp);
        this.popTempValue();
        if (temp.is_number())
            return this.runtime.getLayerByNumber(temp.data);
        else
            return this.runtime.getLayerByName(temp.data);
    }
    Parameter.prototype.get_layout = function ()
    {
        return this.layout;
    };
    Parameter.prototype.get_key = function ()
    {
        return this.key;
    };
    Parameter.prototype.get_instvar = function ()
    {
        return this.index;
    };
    Parameter.prototype.get_familyvar = function (solindex)
    {
        var familytype = this.owner.type;
        var realtype = null;
        var sol = familytype.getCurrentSol();
        var objs = sol.getObjects();
        if (objs.length)
            realtype = objs[solindex % objs.length].type;
        else
        {
;
            realtype = sol.else_instances[solindex % sol.else_instances.length].type;
        }
        return this.index + realtype.family_var_map[familytype.family_index];
    };
    Parameter.prototype.get_eventvar = function ()
    {
        return this.eventvar;
    };
    Parameter.prototype.get_audiofile = function ()
    {
        return this.fileinfo;
    };
    Parameter.prototype.get_variadic = function ()
    {
        var i, len;
        for (i = 0, len = this.subparams.length; i < len; i++)
        {
            this.variadicret[i] = this.subparams[i].get();
        }
        return this.variadicret;
    };
    cr.parameter = Parameter;
    function EventVariable(sheet, parent, m)
    {
        this.sheet = sheet;
        this.parent = parent;
        this.runtime = sheet.runtime;
        this.solModifiers = [];
        if (!this.parent)       // global var
            this.runtime.all_global_vars.push(this);
        this.name = m[1];
        this.vartype = m[2];
        this.initial = m[3];
        this.is_static = !!m[4];
        this.is_constant = !!m[5];
        this.data = this.initial;
    };
    EventVariable.prototype.postInit = function ()
    {
        this.solModifiers = findMatchingSolModifier(this.solModifiers);
    };
    EventVariable.prototype.run = function ()
    {
        if (this.parent && !this.is_static)
            this.data = this.initial;
    };
    cr.eventvariable = EventVariable;
    function EventInclude(sheet, parent, m)
    {
        this.sheet = sheet;
        this.parent = parent;
        this.runtime = sheet.runtime;
        this.solModifiers = [];
        this.include_sheet = null;      // determined in postInit
        this.include_sheet_name = m[1];
    };
    EventInclude.prototype.postInit = function ()
    {
        this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
;
;
        this.sheet.includes.add(this.include_sheet);
        this.solModifiers = findMatchingSolModifier(this.solModifiers);
    };
    EventInclude.prototype.run = function ()
    {
        if (this.parent)
            this.runtime.pushCleanSol(this.runtime.types_by_index);
        if (!this.include_sheet.hasRun)
            this.include_sheet.run();
        if (this.parent)
            this.runtime.popSol(this.runtime.types_by_index);
    };
    cr.eventinclude = EventInclude;
    function EventStackFrame()
    {
        this.temp_parents_arr = [];
        this.reset(null);
        cr.seal(this);
    };
    EventStackFrame.prototype.reset = function (cur_event)
    {
        this.current_event = cur_event;
        this.cndindex = 0;
        this.actindex = 0;
        this.temp_parents_arr.length = 0;
        this.last_event_true = false;
        this.else_branch_ran = false;
    };
    EventStackFrame.prototype.isModifierAfterCnds = function ()
    {
        if (this.current_event.solWriterAfterCnds)
            return true;
        if (this.cndindex < this.current_event.conditions.length - 1)
            return !!this.current_event.solModifiers.length;
        return false;
    };
    cr.eventStackFrame = EventStackFrame;
}());
(function()
{
    function ExpNode(owner_, m)
    {
        this.owner = owner_;
        this.runtime = owner_.runtime;
        this.type = m[0];
;
        this.get = [this.eval_int,
                    this.eval_float,
                    this.eval_string,
                    this.eval_unaryminus,
                    this.eval_add,
                    this.eval_subtract,
                    this.eval_multiply,
                    this.eval_divide,
                    this.eval_mod,
                    this.eval_power,
                    this.eval_and,
                    this.eval_or,
                    this.eval_equal,
                    this.eval_notequal,
                    this.eval_less,
                    this.eval_lessequal,
                    this.eval_greater,
                    this.eval_greaterequal,
                    this.eval_conditional,
                    this.eval_system_exp,
                    this.eval_object_behavior_exp,
                    this.eval_instvar_exp,
                    this.eval_object_behavior_exp,
                    this.eval_eventvar_exp][this.type];
        var paramsModel = null;
        this.value = null;
        this.first = null;
        this.second = null;
        this.third = null;
        this.func = null;
        this.results = null;
        this.parameters = null;
        this.object_type = null;
        this.beh_index = -1;
        this.instance_expr = null;
        this.varindex = -1;
        this.behavior_type = null;
        this.varname = null;
        this.eventvar = null;
        this.return_string = false;
        switch (this.type) {
        case 0:     // int
        case 1:     // float
        case 2:     // string
            this.value = m[1];
            break;
        case 3:     // unaryminus
            this.first = new cr.expNode(owner_, m[1]);
            break;
        case 18:    // conditional
            this.first = new cr.expNode(owner_, m[1]);
            this.second = new cr.expNode(owner_, m[2]);
            this.third = new cr.expNode(owner_, m[3]);
            break;
        case 19:    // system_exp
            this.func = m[1];
;
            this.results = [];
            this.parameters = [];
            if (m.length === 3)
            {
                paramsModel = m[2];
                this.results.length = paramsModel.length + 1;   // must also fit 'ret'
            }
            else
                this.results.length = 1;      // to fit 'ret'
            break;
        case 20:    // object_exp
            this.object_type = this.runtime.types_by_index[m[1]];
;
            this.beh_index = -1;
            this.func = m[2];
            this.return_string = m[3];
            if (m[4])
                this.instance_expr = new cr.expNode(owner_, m[4]);
            else
                this.instance_expr = null;
            this.results = [];
            this.parameters = [];
            if (m.length === 6)
            {
                paramsModel = m[5];
                this.results.length = paramsModel.length + 1;
            }
            else
                this.results.length = 1;    // to fit 'ret'
            break;
        case 21:        // instvar_exp
            this.object_type = this.runtime.types_by_index[m[1]];
;
            this.return_string = m[2];
            if (m[3])
                this.instance_expr = new cr.expNode(owner_, m[3]);
            else
                this.instance_expr = null;
            this.varindex = m[4];
            break;
        case 22:        // behavior_exp
            this.object_type = this.runtime.types_by_index[m[1]];
;
            this.behavior_type = this.object_type.getBehaviorByName(m[2]);
;
            this.beh_index = this.object_type.getBehaviorIndexByName(m[2]);
            this.func = m[3];
            this.return_string = m[4];
            if (m[5])
                this.instance_expr = new cr.expNode(owner_, m[5]);
            else
                this.instance_expr = null;
            this.results = [];
            this.parameters = [];
            if (m.length === 7)
            {
                paramsModel = m[6];
                this.results.length = paramsModel.length + 1;
            }
            else
                this.results.length = 1;    // to fit 'ret'
            break;
        case 23:        // eventvar_exp
            this.varname = m[1];
            this.eventvar = null;   // assigned in postInit
            break;
        }
        if (this.type >= 4 && this.type <= 17)
        {
            this.first = new cr.expNode(owner_, m[1]);
            this.second = new cr.expNode(owner_, m[2]);
        }
        if (paramsModel)
        {
            var i, len;
            for (i = 0, len = paramsModel.length; i < len; i++)
                this.parameters.push(new cr.expNode(owner_, paramsModel[i]));
        }
        cr.seal(this);
    };
    ExpNode.prototype.postInit = function ()
    {
        if (this.type === 23)   // eventvar_exp
        {
            this.eventvar = this.owner.runtime.getEventVariableByName(this.varname, this.owner.block.parent);
;
        }
        if (this.first)
            this.first.postInit();
        if (this.second)
            this.second.postInit();
        if (this.third)
            this.third.postInit();
        if (this.instance_expr)
            this.instance_expr.postInit();
        if (this.parameters)
        {
            var i, len;
            for (i = 0, len = this.parameters.length; i < len; i++)
                this.parameters[i].postInit();
        }
    };
    ExpNode.prototype.eval_system_exp = function (ret)
    {
        this.results[0] = ret;
        var temp = this.owner.pushTempValue();
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++)
        {
            this.parameters[i].get(temp);
            this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
        }
        this.owner.popTempValue();
        this.func.apply(this.runtime.system, this.results);
    };
    ExpNode.prototype.eval_object_behavior_exp = function (ret)
    {
        var sol = this.object_type.getCurrentSol();
        var instances = sol.getObjects();
        if (!instances.length)
        {
            if (sol.else_instances.length)
                instances = sol.else_instances;
            else
            {
                if (this.return_string)
                    ret.set_string("");
                else
                    ret.set_int(0);
                return;
            }
        }
        this.results[0] = ret;
        ret.object_class = this.object_type;        // so expression can access family type if need be
        var temp = this.owner.pushTempValue();
        var i, len;
        for (i = 0, len = this.parameters.length; i < len; i++) {
            this.parameters[i].get(temp);
            this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
        }
        var index = this.owner.solindex;
        if (this.instance_expr) {
            this.instance_expr.get(temp);
            if (temp.is_number()) {
                index = temp.data;
                instances = this.object_type.instances;    // pick from all instances, not SOL
            }
        }
        this.owner.popTempValue();
        index %= instances.length;      // wraparound
        if (index < 0)
            index += instances.length;
        var returned_val;
        var inst = instances[index];
        if (this.beh_index > -1)
        {
            var offset = 0;
            if (this.object_type.is_family)
            {
                offset = inst.type.family_beh_map[this.object_type.family_index];
            }
            returned_val = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
        }
        else
            returned_val = this.func.apply(inst, this.results);
;
    };
    ExpNode.prototype.eval_instvar_exp = function (ret)
    {
        var sol = this.object_type.getCurrentSol();
        var instances = sol.getObjects();
        if (!instances.length)
        {
            if (sol.else_instances.length)
                instances = sol.else_instances;
            else
            {
                if (this.return_string)
                    ret.set_string("");
                else
                    ret.set_int(0);
                return;
            }
        }
        var index = this.owner.solindex;
        if (this.instance_expr)
        {
            var temp = this.owner.pushTempValue();
            this.instance_expr.get(temp);
            if (temp.is_number())
            {
                index = temp.data;
                var type_instances = this.object_type.instances;
                index %= type_instances.length;     // wraparound
                if (index < 0)                      // offset
                    index += type_instances.length;
                var to_ret = type_instances[index].instance_vars[this.varindex];
                if (cr.is_string(to_ret))
                    ret.set_string(to_ret);
                else
                    ret.set_float(to_ret);
                this.owner.popTempValue();
                return;         // done
            }
            this.owner.popTempValue();
        }
        index %= instances.length;      // wraparound
        if (index < 0)
            index += instances.length;
        var inst = instances[index];
        var offset = 0;
        if (this.object_type.is_family)
        {
            offset = inst.type.family_var_map[this.object_type.family_index];
        }
        var to_ret = inst.instance_vars[this.varindex + offset];
        if (cr.is_string(to_ret))
            ret.set_string(to_ret);
        else
            ret.set_float(to_ret);
    };
    ExpNode.prototype.eval_int = function (ret)
    {
        ret.type = cr.exptype.Integer;
        ret.data = this.value;
    };
    ExpNode.prototype.eval_float = function (ret)
    {
        ret.type = cr.exptype.Float;
        ret.data = this.value;
    };
    ExpNode.prototype.eval_string = function (ret)
    {
        ret.type = cr.exptype.String;
        ret.data = this.value;
    };
    ExpNode.prototype.eval_unaryminus = function (ret)
    {
        this.first.get(ret);                // retrieve operand
        if (ret.is_number())
            ret.data = -ret.data;
    };
    ExpNode.prototype.eval_add = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data += temp.data;          // both operands numbers: add
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_subtract = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data -= temp.data;          // both operands numbers: subtract
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_multiply = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data *= temp.data;          // both operands numbers: multiply
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_divide = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data /= temp.data;          // both operands numbers: divide
            ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_mod = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data %= temp.data;          // both operands numbers: modulo
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_power = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            ret.data = Math.pow(ret.data, temp.data);   // both operands numbers: raise to power
            if (temp.is_float())
                ret.make_float();
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_and = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number())
        {
            if (temp.is_string())
            {
                ret.set_string(ret.data.toString() + temp.data);
            }
            else
            {
                if (ret.data && temp.data)
                    ret.set_int(1);
                else
                    ret.set_int(0);
            }
        }
        else if (ret.is_string())
        {
            if (temp.is_string())
                ret.data += temp.data;
            else
            {
                ret.data += (Math.round(temp.data * 1e10) / 1e10).toString();
            }
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_or = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        if (ret.is_number() && temp.is_number())
        {
            if (ret.data || temp.data)
                ret.set_int(1);
            else
                ret.set_int(0);
        }
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_conditional = function (ret)
    {
        this.first.get(ret);                // condition operand
        if (ret.data)                       // is true
            this.second.get(ret);           // evaluate second operand to ret
        else
            this.third.get(ret);            // evaluate third operand to ret
    };
    ExpNode.prototype.eval_equal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data === temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_notequal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data !== temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_less = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data < temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_lessequal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data <= temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_greater = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data > temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_greaterequal = function (ret)
    {
        this.first.get(ret);                // left operand
        var temp = this.owner.pushTempValue();
        this.second.get(temp);          // right operand
        ret.set_int(ret.data >= temp.data ? 1 : 0);
        this.owner.popTempValue();
    };
    ExpNode.prototype.eval_eventvar_exp = function (ret)
    {
        if (cr.is_number(this.eventvar.data))
            ret.set_float(this.eventvar.data);
        else
            ret.set_string(this.eventvar.data);
    };
    cr.expNode = ExpNode;
    function ExpValue(type, data)
    {
        this.type = type || cr.exptype.Integer;
        this.data = data || 0;
        this.object_class = null;
;
;
;
        if (this.type == cr.exptype.Integer)
            this.data = Math.floor(this.data);
        cr.seal(this);
    };
    ExpValue.prototype.is_int = function ()
    {
        return this.type === cr.exptype.Integer;
    };
    ExpValue.prototype.is_float = function ()
    {
        return this.type === cr.exptype.Float;
    };
    ExpValue.prototype.is_number = function ()
    {
        return this.type === cr.exptype.Integer || this.type === cr.exptype.Float;
    };
    ExpValue.prototype.is_string = function ()
    {
        return this.type === cr.exptype.String;
    };
    ExpValue.prototype.make_int = function ()
    {
        if (!this.is_int())
        {
            if (this.is_float())
                this.data = Math.floor(this.data);      // truncate float
            else if (this.is_string())
                this.data = parseInt(this.data, 10);
            this.type = cr.exptype.Integer;
        }
    };
    ExpValue.prototype.make_float = function ()
    {
        if (!this.is_float())
        {
            if (this.is_string())
                this.data = parseFloat(this.data);
            this.type = cr.exptype.Float;
        }
    };
    ExpValue.prototype.make_string = function ()
    {
        if (!this.is_string())
        {
            this.data = this.data.toString();
            this.type = cr.exptype.String;
        }
    };
    ExpValue.prototype.set_int = function (val)
    {
;
        this.type = cr.exptype.Integer;
        this.data = Math.floor(val);
    };
    ExpValue.prototype.set_float = function (val)
    {
;
        this.type = cr.exptype.Float;
        this.data = val;
    };
    ExpValue.prototype.set_string = function (val)
    {
;
        this.type = cr.exptype.String;
        this.data = val;
    };
    ExpValue.prototype.set_any = function (val)
    {
        if (cr.is_number(val))
        {
            this.type = cr.exptype.Float;
            this.data = val;
        }
        else if (cr.is_string(val))
        {
            this.type = cr.exptype.String;
            this.data = val.toString();
        }
        else
        {
            this.type = cr.exptype.Integer;
            this.data = 0;
        }
    };
    cr.expvalue = ExpValue;
    cr.exptype = {
        Integer: 0,     // emulated; no native integer support in javascript
        Float: 1,
        String: 2
    };
}());
;
cr.system_object = function (runtime)
{
    this.runtime = runtime;
    this.waits = [];
};
(function ()
{
    var sysProto = cr.system_object.prototype;
    function SysCnds() {};
    SysCnds.prototype.EveryTick = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutStart = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutEnd = function()
    {
        return true;
    };
    SysCnds.prototype.Compare = function(x, cmp, y)
    {
        return cr.do_cmp(x, cmp, y);
    };
    SysCnds.prototype.CompareTime = function (cmp, t)
    {
        var elapsed = this.runtime.kahanTime.sum;
        if (cmp === 0)
        {
            var cnd = this.runtime.getCurrentCondition();
            if (!cnd.extra.CompareTime_executed)
            {
                if (elapsed >= t)
                {
                    cnd.extra.CompareTime_executed = true;
                    return true;
                }
            }
            return false;
        }
        return cr.do_cmp(elapsed, cmp, t);
    };
    SysCnds.prototype.LayerVisible = function (layer)
    {
        if (!layer)
            return false;
        else
            return layer.visible;
    };
    SysCnds.prototype.LayerCmpOpacity = function (layer, cmp, opacity_)
    {
        if (!layer)
            return false;
        return cr.do_cmp(layer.opacity * 100, cmp, opacity_);
    };
    SysCnds.prototype.Repeat = function (count)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
        if (solModifierAfterCnds)
        {
            for (i = 0; i < count && !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            for (i = 0; i < count && !current_loop.stopped; i++)
            {
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        return false;
    };
    SysCnds.prototype.While = function (count)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
        if (solModifierAfterCnds)
        {
            for (i = 0; !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_loop.index = i;
                if (!current_event.retrigger())     // one of the other conditions returned false
                    current_loop.stopped = true;    // break
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            for (i = 0; !current_loop.stopped; i++)
            {
                current_loop.index = i;
                if (!current_event.retrigger())
                    current_loop.stopped = true;
            }
        }
        this.runtime.popLoopStack();
        return false;
    };
    SysCnds.prototype.For = function (name, start, end)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack(name);
        var i;
        if (solModifierAfterCnds)
        {
            for (i = start; i <= end && !current_loop.stopped; i++)  // inclusive to end
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            for (i = start; i <= end && !current_loop.stopped; i++)  // inclusive to end
            {
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        return false;
    };
    var foreach_instancestack = [];
    var foreach_instanceptr = -1;
    SysCnds.prototype.ForEach = function (obj)
    {
        var sol = obj.getCurrentSol();
        foreach_instanceptr++;
        if (foreach_instancestack.length === foreach_instanceptr)
            foreach_instancestack.push([]);
        var instances = foreach_instancestack[foreach_instanceptr];
        cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len;
        if (solModifierAfterCnds)
        {
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                sol = obj.getCurrentSol();
                sol.select_all = false;
                sol.instances.length = 1;
                sol.instances[0] = instances[i];
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            sol.select_all = false;
            sol.instances.length = 1;
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                sol.instances[0] = instances[i];
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        foreach_instanceptr--;
        return false;
    };
    function foreach_sortinstances(a, b)
    {
        var va = a.extra.c2_foreachordered_val;
        var vb = b.extra.c2_foreachordered_val;
        if (cr.is_number(va) && cr.is_number(vb))
            return va - vb;
        else
        {
            va = "" + va;
            vb = "" + vb;
            if (va < vb)
                return -1;
            else if (va > vb)
                return 1;
            else
                return 0;
        }
    };
    SysCnds.prototype.ForEachOrdered = function (obj, exp, order)
    {
        var sol = obj.getCurrentSol();
        foreach_instanceptr++;
        if (foreach_instancestack.length === foreach_instanceptr)
            foreach_instancestack.push([]);
        var instances = foreach_instancestack[foreach_instanceptr];
        cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var current_condition = this.runtime.getCurrentCondition();
        var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].extra.c2_foreachordered_val = current_condition.parameters[1].get(i);
        }
        instances.sort(foreach_sortinstances);
        if (order === 1)
            instances.reverse();
        if (solModifierAfterCnds)
        {
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                this.runtime.pushCopySol(current_event.solModifiers);
                sol = obj.getCurrentSol();
                sol.select_all = false;
                sol.instances.length = 1;
                sol.instances[0] = instances[i];
                current_loop.index = i;
                current_event.retrigger();
                this.runtime.popSol(current_event.solModifiers);
            }
        }
        else
        {
            sol.select_all = false;
            sol.instances.length = 1;
            for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
            {
                sol.instances[0] = instances[i];
                current_loop.index = i;
                current_event.retrigger();
            }
        }
        this.runtime.popLoopStack();
        foreach_instanceptr--;
        return false;
    };
    SysCnds.prototype.TriggerOnce = function ()
    {
        var cndextra = this.runtime.getCurrentCondition().extra;
        if (typeof cndextra.TriggerOnce_lastTick === "undefined")
            cndextra.TriggerOnce_lastTick = -1;
        var last_tick = cndextra.TriggerOnce_lastTick;
        var cur_tick = this.runtime.tickcount;
        cndextra.TriggerOnce_lastTick = cur_tick;
        return this.runtime.layout_first_tick || last_tick !== cur_tick - 1;
    };
    SysCnds.prototype.Every = function (seconds)
    {
        var cnd = this.runtime.getCurrentCondition();
        var last_time = cnd.extra.Every_lastTime || 0;
        var cur_time = this.runtime.kahanTime.sum;
        if (cur_time >= last_time + seconds)
        {
            cnd.extra.Every_lastTime = last_time + seconds;
            if (cur_time >= cnd.extra.Every_lastTime + seconds)
                cnd.extra.Every_lastTime = cur_time;
            return true;
        }
        else
            return false;
    };
    SysCnds.prototype.PickNth = function (obj, index)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        index = cr.floor(index);
        if (index < 0 || index >= instances.length)
            return false;
        var inst = instances[index];
        sol.pick_one(inst);
        return true;
    };
    SysCnds.prototype.PickRandom = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var index = cr.floor(Math.random() * instances.length);
        if (index >= instances.length)
            return false;
        var inst = instances[index];
        sol.pick_one(inst);
        return true;
    };
    SysCnds.prototype.CompareVar = function (v, cmp, val)
    {
        return cr.do_cmp(v.data, cmp, val);
    };
    SysCnds.prototype.IsGroupActive = function (group)
    {
        return this.runtime.activeGroups[(/*this.runtime.getCurrentCondition().sheet.name + "|" + */group).toLowerCase()];
    };
    SysCnds.prototype.IsPreview = function ()
    {
        return typeof cr_is_preview !== "undefined";
    };
    SysCnds.prototype.PickAll = function (obj)
    {
        if (!obj)
            return false;
        if (!obj.instances.length)
            return false;
        var sol = obj.getCurrentSol();
        sol.select_all = true;
        return true;
    };
    SysCnds.prototype.IsMobile = function ()
    {
        return this.runtime.isMobile;
    };
    SysCnds.prototype.CompareBetween = function (x, a, b)
    {
        return x >= a && x <= b;
    };
    SysCnds.prototype.Else = function ()
    {
        var current_frame = this.runtime.getCurrentEventStack();
        if (current_frame.else_branch_ran)
            return false;       // another event in this else-if chain has run
        else
            return !current_frame.last_event_true;
        /*
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
        var prev_event = current_event.prev_block;
        if (!prev_event)
            return false;
        if (prev_event.is_logical)
            return !this.runtime.last_event_true;
        var i, len, j, lenj, s, sol, temp, inst, any_picked = false;
        for (i = 0, len = prev_event.cndReferences.length; i < len; i++)
        {
            s = prev_event.cndReferences[i];
            sol = s.getCurrentSol();
            if (sol.select_all || sol.instances.length === s.instances.length)
            {
                sol.select_all = false;
                sol.instances.length = 0;
            }
            else
            {
                if (sol.instances.length === 1 && sol.else_instances.length === 0 && s.instances.length >= 2)
                {
                    inst = sol.instances[0];
                    sol.instances.length = 0;
                    for (j = 0, lenj = s.instances.length; j < lenj; j++)
                    {
                        if (s.instances[j] != inst)
                            sol.instances.push(s.instances[j]);
                    }
                    any_picked = true;
                }
                else
                {
                    temp = sol.instances;
                    sol.instances = sol.else_instances;
                    sol.else_instances = temp;
                    any_picked = true;
                }
            }
        }
        return any_picked;
        */
    };
    SysCnds.prototype.OnLoadFinished = function ()
    {
        return true;
    };
    SysCnds.prototype.OnCanvasSnapshot = function ()
    {
        return true;
    };
    SysCnds.prototype.EffectsSupported = function ()
    {
        return !!this.runtime.glwrap;
    };
    sysProto.cnds = new SysCnds();
    function SysActs() {};
    SysActs.prototype.GoToLayout = function(to)
    {
        if (this.runtime.isloading)
            return;     // cannot change layout while loading on loader layout
        if (this.runtime.changelayout)
            return;     // already changing to a different layout
;
        this.runtime.changelayout = to;
    };
    SysActs.prototype.CreateObject = function (obj, layer, x, y)
    {
        if (!layer || !obj)
            return;
        var inst = this.runtime.createInstance(obj, layer, x, y);
        if (!inst)
            return;
        this.runtime.isInOnDestroy++;
        this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
        this.runtime.isInOnDestroy--;
        var sol = obj.getCurrentSol();
        sol.select_all = false;
        sol.instances.length = 1;
        sol.instances[0] = inst;
    };
    SysActs.prototype.SetLayerVisible = function (layer, visible_)
    {
        if (!layer)
            return;
        if (layer.visible !== visible_)
        {
            layer.visible = visible_;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.SetLayerOpacity = function (layer, opacity_)
    {
        if (!layer)
            return;
        opacity_ = cr.clamp(opacity_ / 100, 0, 1);
        if (layer.opacity !== opacity_)
        {
            layer.opacity = opacity_;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.SetLayerScaleRate = function (layer, sr)
    {
        if (!layer)
            return;
        if (layer.zoomRate !== sr)
        {
            layer.zoomRate = sr;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.SetLayoutScale = function (s)
    {
        if (!this.runtime.running_layout)
            return;
        if (this.runtime.running_layout.scale !== s)
        {
            this.runtime.running_layout.scale = s;
            this.runtime.redraw = true;
        }
    };
    SysActs.prototype.ScrollX = function(x)
    {
        this.runtime.running_layout.scrollToX(x);
    };
    SysActs.prototype.ScrollY = function(y)
    {
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.Scroll = function(x, y)
    {
        this.runtime.running_layout.scrollToX(x);
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.ScrollToObject = function(obj)
    {
        var inst = obj.getFirstPicked();
        if (inst)
        {
            this.runtime.running_layout.scrollToX(inst.x);
            this.runtime.running_layout.scrollToY(inst.y);
        }
    };
    SysActs.prototype.SetVar = function(v, x)
    {
;
        if (v.vartype === 0)
        {
            if (cr.is_number(x))
                v.data = x;
            else
                v.data = parseFloat(x);
        }
        else if (v.vartype === 1)
            v.data = x.toString();
    };
    SysActs.prototype.AddVar = function(v, x)
    {
;
        if (v.vartype === 0)
        {
            if (cr.is_number(x))
                v.data += x;
            else
                v.data += parseFloat(x);
        }
        else if (v.vartype === 1)
            v.data += x.toString();
    };
    SysActs.prototype.SubVar = function(v, x)
    {
;
        if (v.vartype === 0)
        {
            if (cr.is_number(x))
                v.data -= x;
            else
                v.data -= parseFloat(x);
        }
    };
    SysActs.prototype.SetGroupActive = function (group, active)
    {
        var activeGroups = this.runtime.activeGroups;
        var groupkey = (/*this.runtime.getCurrentAction().sheet.name + "|" + */group).toLowerCase();
        switch (active) {
        case 0:
            activeGroups[groupkey] = false;
            break;
        case 1:
            activeGroups[groupkey] = true;
            break;
        case 2:
            activeGroups[groupkey] = !activeGroups[groupkey];
            break;
        }
    };
    SysActs.prototype.SetTimescale = function (ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        this.runtime.timescale = ts;
    };
    SysActs.prototype.SetObjectTimescale = function (obj, ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        if (!obj)
            return;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = ts;
        }
    };
    SysActs.prototype.RestoreObjectTimescale = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = -1.0;
        }
    };
    SysActs.prototype.Wait = function (seconds)
    {
        if (seconds < 0)
            return;
        var i, len, s, t;
        var evinfo = this.runtime.getCurrentEventStack();
        var waitobj = {};
        waitobj.time = this.runtime.kahanTime.sum + seconds;
        waitobj.ev = evinfo.current_event;
        waitobj.actindex = evinfo.actindex + 1; // pointing at next action
        waitobj.deleteme = false;
        waitobj.sols = {};
        waitobj.solModifiers = [];
        for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
        {
            t = this.runtime.types_by_index[i];
            s = t.getCurrentSol();
            if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
                continue;
            waitobj.solModifiers.push(t);
            waitobj.sols[i.toString()] = s.instances.slice(0);
        }
        this.waits.push(waitobj);
        return true;
    };
    SysActs.prototype.SetLayerScale = function (layer, scale)
    {
        if (!layer)
            return;
        if (layer.scale === scale)
            return;
        layer.scale = scale;
        this.runtime.redraw = true;
    };
    SysActs.prototype.ResetGlobals = function ()
    {
        var i, len, g;
        for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++)
        {
            g = this.runtime.all_global_vars[i];
            g.data = g.initial;
        }
    };
    SysActs.prototype.SetLayoutAngle = function (a)
    {
        a = cr.to_radians(a);
        a = cr.clamp_angle(a);
        if (this.runtime.running_layout)
        {
            if (this.runtime.running_layout.angle !== a)
            {
                this.runtime.running_layout.angle = a;
                this.runtime.redraw = true;
            }
        }
    };
    SysActs.prototype.SetLayerAngle = function (layer, a)
    {
        if (!layer)
            return;
        a = cr.to_radians(a);
        a = cr.clamp_angle(a);
        if (layer.angle === a)
            return;
        layer.angle = a;
        this.runtime.redraw = true;
    };
    SysActs.prototype.StopLoop = function ()
    {
        if (this.runtime.loop_stack_index < 0)
            return;     // no loop currently running
        this.runtime.getCurrentLoop().stopped = true;
    };
    SysActs.prototype.GoToLayoutByName = function (layoutname)
    {
        if (this.runtime.isloading)
            return;     // cannot change layout while loading on loader layout
        if (this.runtime.changelayout)
            return;     // already changing to different layout
;
        var l;
        for (l in this.runtime.layouts)
        {
            if (this.runtime.layouts.hasOwnProperty(l) && l.toLowerCase() === layoutname.toLowerCase())
            {
                this.runtime.changelayout = this.runtime.layouts[l];
                return;
            }
        }
    };
    SysActs.prototype.RestartLayout = function (layoutname)
    {
        if (this.runtime.isloading)
            return;     // cannot restart loader layouts
        if (this.runtime.changelayout)
            return;     // already changing to a different layout
;
        if (!this.runtime.running_layout)
            return;
        this.runtime.changelayout = this.runtime.running_layout;
        var i, len, g;
        for (i = 0, len = this.runtime.allGroups.length; i < len; i++)
        {
            g = this.runtime.allGroups[i];
            this.runtime.activeGroups[g.group_name.toLowerCase()] = g.initially_activated;
        }
    };
    SysActs.prototype.SnapshotCanvas = function (format_, quality_)
    {
        this.runtime.snapshotCanvas = [format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100];
        this.runtime.redraw = true;     // force redraw so snapshot is always taken
    };
    SysActs.prototype.SetCanvasSize = function (w, h)
    {
        if (w <= 0 || h <= 0)
            return;
        this.runtime["setSize"](w, h);
    };
    SysActs.prototype.SetLayoutEffectEnabled = function (enable_, effectname_)
    {
        if (!this.runtime.running_layout || !this.runtime.glwrap)
            return;
        var et = this.runtime.running_layout.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var enable = (enable_ === 1);
        if (et.active == enable)
            return;     // no change
        et.active = enable;
        this.runtime.running_layout.updateActiveEffects();
        this.runtime.redraw = true;
    };
    SysActs.prototype.SetLayerEffectEnabled = function (layer, enable_, effectname_)
    {
        if (!layer || !this.runtime.glwrap)
            return;
        var et = layer.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var enable = (enable_ === 1);
        if (et.active == enable)
            return;     // no change
        et.active = enable;
        layer.updateActiveEffects();
        this.runtime.redraw = true;
    };
    SysActs.prototype.SetLayoutEffectParam = function (effectname_, index_, value_)
    {
        if (!this.runtime.running_layout || !this.runtime.glwrap)
            return;
        var et = this.runtime.running_layout.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var params = this.runtime.running_layout.effect_params[et.index];
        index_ = Math.floor(index_);
        if (index_ < 0 || index_ >= params.length)
            return;     // effect index out of bounds
        if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
            value_ /= 100.0;
        if (params[index_] === value_)
            return;     // no change
        params[index_] = value_;
        if (et.active)
            this.runtime.redraw = true;
    };
    SysActs.prototype.SetLayerEffectParam = function (layer, effectname_, index_, value_)
    {
        if (!layer || !this.runtime.glwrap)
            return;
        var et = layer.getEffectByName(effectname_);
        if (!et)
            return;     // effect name not found
        var params = layer.effect_params[et.index];
        index_ = Math.floor(index_);
        if (index_ < 0 || index_ >= params.length)
            return;     // effect index out of bounds
        if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
            value_ /= 100.0;
        if (params[index_] === value_)
            return;     // no change
        params[index_] = value_;
        if (et.active)
            this.runtime.redraw = true;
    };
    sysProto.acts = new SysActs();
    function SysExps() {};
    SysExps.prototype["int"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_int(parseInt(x, 10));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_int(x);
    };
    SysExps.prototype["float"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_float(parseFloat(x));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_float(x);
    };
    SysExps.prototype.str = function(ret, x)
    {
        if (cr.is_string(x))
            ret.set_string(x);
        else
            ret.set_string(x.toString());
    };
    SysExps.prototype.len = function(ret, x)
    {
        ret.set_int(x.length || 0);
    };
    SysExps.prototype.random = function (ret, a, b)
    {
        if (b === undefined)
        {
            ret.set_float(Math.random() * a);
        }
        else
        {
            ret.set_float(Math.random() * (b - a) + a);
        }
    };
    SysExps.prototype.sqrt = function(ret, x)
    {
        ret.set_float(Math.sqrt(x));
    };
    SysExps.prototype.abs = function(ret, x)
    {
        ret.set_float(Math.abs(x));
    };
    SysExps.prototype.round = function(ret, x)
    {
        ret.set_int(Math.round(x));
    };
    SysExps.prototype.floor = function(ret, x)
    {
        ret.set_int(Math.floor(x));
    };
    SysExps.prototype.ceil = function(ret, x)
    {
        ret.set_int(Math.ceil(x));
    };
    SysExps.prototype.sin = function(ret, x)
    {
        ret.set_float(Math.sin(cr.to_radians(x)));
    };
    SysExps.prototype.cos = function(ret, x)
    {
        ret.set_float(Math.cos(cr.to_radians(x)));
    };
    SysExps.prototype.tan = function(ret, x)
    {
        ret.set_float(Math.tan(cr.to_radians(x)));
    };
    SysExps.prototype.asin = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.asin(x)));
    };
    SysExps.prototype.acos = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.acos(x)));
    };
    SysExps.prototype.atan = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.atan(x)));
    };
    SysExps.prototype.exp = function(ret, x)
    {
        ret.set_float(Math.exp(x));
    };
    SysExps.prototype.ln = function(ret, x)
    {
        ret.set_float(Math.log(x));
    };
    SysExps.prototype.log10 = function(ret, x)
    {
        ret.set_float(Math.log(x) / Math.LN10);
    };
    SysExps.prototype.max = function(ret)
    {
        var max_ = arguments[1];
        var i, len;
        for (i = 2, len = arguments.length; i < len; i++)
        {
            if (max_ < arguments[i])
                max_ = arguments[i];
        }
        ret.set_float(max_);
    };
    SysExps.prototype.min = function(ret)
    {
        var min_ = arguments[1];
        var i, len;
        for (i = 2, len = arguments.length; i < len; i++)
        {
            if (min_ > arguments[i])
                min_ = arguments[i];
        }
        ret.set_float(min_);
    };
    SysExps.prototype.dt = function(ret)
    {
        ret.set_float(this.runtime.dt);
    };
    SysExps.prototype.timescale = function(ret)
    {
        ret.set_float(this.runtime.timescale);
    };
    SysExps.prototype.wallclocktime = function(ret)
    {
        ret.set_float((Date.now() - this.runtime.start_time) / 1000.0);
    };
    SysExps.prototype.time = function(ret)
    {
        ret.set_float(this.runtime.kahanTime.sum);
    };
    SysExps.prototype.tickcount = function(ret)
    {
        ret.set_int(this.runtime.tickcount);
    };
    SysExps.prototype.objectcount = function(ret)
    {
        ret.set_int(this.runtime.objectcount);
    };
    SysExps.prototype.fps = function(ret)
    {
        ret.set_int(this.runtime.fps);
    };
    SysExps.prototype.loopindex = function(ret, name_)
    {
        if (!this.runtime.loop_stack.length)
        {
            ret.set_int(0);
            return;
        }
        if (name_)
        {
            var i, len;
            for (i = 0, len = this.runtime.loop_stack.length; i < len; i++)
            {
                var loop = this.runtime.loop_stack[i];
                if (loop.name === name_)
                {
                    ret.set_int(loop.index);
                    return;
                }
            }
            ret.set_int(0);
        }
        else
        {
            ret.set_int(this.runtime.getCurrentLoop().index);
        }
    };
    SysExps.prototype.distance = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.distanceTo(x1, y1, x2, y2));
    };
    SysExps.prototype.angle = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)));
    };
    SysExps.prototype.scrollx = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollX);
    };
    SysExps.prototype.scrolly = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollY);
    };
    SysExps.prototype.newline = function(ret)
    {
        ret.set_string("\n");
    };
    SysExps.prototype.lerp = function(ret, a, b, x)
    {
        ret.set_float(cr.lerp(a, b, x));
    };
    SysExps.prototype.windowwidth = function(ret)
    {
        ret.set_int(this.runtime.width);
    };
    SysExps.prototype.windowheight = function(ret)
    {
        ret.set_int(this.runtime.height);
    };
    SysExps.prototype.uppercase = function(ret, str)
    {
        ret.set_string(cr.is_string(str) ? str.toUpperCase() : "");
    };
    SysExps.prototype.lowercase = function(ret, str)
    {
        ret.set_string(cr.is_string(str) ? str.toLowerCase() : "");
    };
    SysExps.prototype.clamp = function(ret, x, l, u)
    {
        if (x < l)
            ret.set_float(l);
        else if (x > u)
            ret.set_float(u);
        else
            ret.set_float(x);
    };
    SysExps.prototype.layerscale = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(layer.scale);
    };
    SysExps.prototype.layeropacity = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(layer.opacity * 100);
    };
    SysExps.prototype.layerscalerate = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(layer.zoomRate);
    };
    SysExps.prototype.layoutscale = function (ret)
    {
        if (this.runtime.running_layout)
            ret.set_float(this.runtime.running_layout.scale);
        else
            ret.set_float(0);
    };
    SysExps.prototype.layoutangle = function (ret)
    {
        ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));
    };
    SysExps.prototype.layerangle = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        if (!layer)
            ret.set_float(0);
        else
            ret.set_float(cr.to_degrees(layer.angle));
    };
    SysExps.prototype.layoutwidth = function (ret)
    {
        ret.set_int(this.runtime.running_layout.width);
    };
    SysExps.prototype.layoutheight = function (ret)
    {
        ret.set_int(this.runtime.running_layout.height);
    };
    SysExps.prototype.find = function (ret, text, searchstr)
    {
        if (cr.is_string(text) && cr.is_string(searchstr))
            ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
        else
            ret.set_int(-1);
    };
    SysExps.prototype.left = function (ret, text, n)
    {
        ret.set_string(cr.is_string(text) ? text.substr(0, n) : "");
    };
    SysExps.prototype.right = function (ret, text, n)
    {
        ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "");
    };
    SysExps.prototype.mid = function (ret, text, index_, length_)
    {
        ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "");
    };
    SysExps.prototype.tokenat = function (ret, text, index_, sep)
    {
        if (cr.is_string(text) && cr.is_string(sep))
        {
            var arr = text.split(sep);
            var i = cr.floor(index_);
            if (i < 0 || i >= arr.length)
                ret.set_string("");
            else
                ret.set_string(arr[i]);
        }
        else
            ret.set_string("");
    };
    SysExps.prototype.tokencount = function (ret, text, sep)
    {
        if (cr.is_string(text) && text.length)
            ret.set_int(text.split(sep).length);
        else
            ret.set_int(0);
    };
    SysExps.prototype.replace = function (ret, text, find_, replace_)
    {
        if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_))
            ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
        else
            ret.set_string(cr.is_string(text) ? text : "");
    };
    SysExps.prototype.trim = function (ret, text)
    {
        ret.set_string(cr.is_string(text) ? text.trim() : "");
    };
    SysExps.prototype.pi = function (ret)
    {
        ret.set_float(cr.PI);
    };
    SysExps.prototype.layoutname = function (ret)
    {
        if (this.runtime.running_layout)
            ret.set_string(this.runtime.running_layout.name);
        else
            ret.set_string("");
    };
    SysExps.prototype.renderer = function (ret)
    {
        ret.set_string(this.runtime.gl ? "webgl" : "canvas2d");
    };
    SysExps.prototype.anglediff = function (ret, a, b)
    {
        ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))));
    };
    SysExps.prototype.choose = function (ret)
    {
        var index = cr.floor(Math.random() * (arguments.length - 1));
        ret.set_any(arguments[index + 1]);
    };
    SysExps.prototype.rgb = function (ret, r, g, b)
    {
        ret.set_int(cr.RGB(r, g, b));
    };
    SysExps.prototype.projectversion = function (ret)
    {
        ret.set_string(this.runtime.versionstr);
    };
    SysExps.prototype.anglelerp = function (ret, a, b, x)
    {
        a = cr.to_radians(a);
        b = cr.to_radians(b);
        var diff = cr.angleDiff(a, b);
        if (cr.angleClockwise(b, a))
        {
            ret.set_float(cr.to_clamped_degrees(a + diff * x));
        }
        else
        {
            ret.set_float(cr.to_clamped_degrees(a - diff * x));
        }
    };
    SysExps.prototype.anglerotate = function (ret, a, b, c)
    {
        a = cr.to_radians(a);
        b = cr.to_radians(b);
        c = cr.to_radians(c);
        ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)));
    };
    SysExps.prototype.zeropad = function (ret, n, d)
    {
        var s = (n < 0 ? "-" : "");
        if (n < 0) n = -n;
        var zeroes = d - n.toString().length;
        for (var i = 0; i < zeroes; i++)
            s += "0";
        ret.set_string(s + n.toString());
    };
    SysExps.prototype.cpuutilisation = function (ret)
    {
        ret.set_float(this.runtime.cpuutilisation / 1000);
    };
    SysExps.prototype.viewportleft = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewLeft : 0);
    };
    SysExps.prototype.viewporttop = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewTop : 0);
    };
    SysExps.prototype.viewportright = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewRight : 0);
    };
    SysExps.prototype.viewportbottom = function (ret, layerparam)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.viewBottom : 0);
    };
    SysExps.prototype.loadingprogress = function (ret)
    {
        ret.set_float(this.runtime.loadingprogress);
    };
    SysExps.prototype.unlerp = function(ret, a, b, y)
    {
        ret.set_float((y - a) / (b - a));
    };
    SysExps.prototype.canvassnapshot = function (ret)
    {
        ret.set_string(this.runtime.snapshotData);
    };
    SysExps.prototype.urlencode = function (ret, s)
    {
        ret.set_string(encodeURIComponent(s));
    };
    SysExps.prototype.urldecode = function (ret, s)
    {
        ret.set_string(decodeURIComponent(s));
    };
    SysExps.prototype.canvastolayerx = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0);
    };
    SysExps.prototype.canvastolayery = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0);
    };
    SysExps.prototype.layertocanvasx = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0);
    };
    SysExps.prototype.layertocanvasy = function (ret, layerparam, x, y)
    {
        var layer = this.runtime.getLayer(layerparam);
        ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0);
    };
    sysProto.exps = new SysExps();
    sysProto.runWaits = function ()
    {
        var i, j, len, w, k, s;
        var evinfo = this.runtime.getCurrentEventStack();
        for (i = 0, len = this.waits.length; i < len; i++)
        {
            w = this.waits[i];
            if (w.time > this.runtime.kahanTime.sum)
                continue;
            evinfo.current_event = w.ev;
            evinfo.actindex = w.actindex;
            evinfo.cndindex = 0;
            for (k in w.sols)
            {
                if (w.sols.hasOwnProperty(k))
                {
                    s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
                    s.select_all = false;
                    s.instances = w.sols[k];
                }
            }
            w.ev.resume_actions_and_subevents();
            this.runtime.clearSol(w.solModifiers);
            w.deleteme = true;
        }
        for (i = 0, j = 0, len = this.waits.length; i < len; i++)
        {
            w = this.waits[i];
            this.waits[j] = w;
            if (!w.deleteme)
                j++;
        }
        this.waits.length = j;
    };
}());
;
cr.add_common_aces = function (m)
{
    var pluginProto = m[0].prototype;
    var singleglobal_ = m[1];
    var position_aces = m[3];
    var size_aces = m[4];
    var angle_aces = m[5];
    var appearance_aces = m[6];
    var zorder_aces = m[7];
    var effects_aces = m[8];
    if (!pluginProto.cnds)
        pluginProto.cnds = {};
    if (!pluginProto.acts)
        pluginProto.acts = {};
    if (!pluginProto.exps)
        pluginProto.exps = {};
    var cnds = pluginProto.cnds;
    var acts = pluginProto.acts;
    var exps = pluginProto.exps;
    if (position_aces)
    {
        cnds.CompareX = function (cmp, x)
        {
            return cr.do_cmp(this.x, cmp, x);
        };
        cnds.CompareY = function (cmp, y)
        {
            return cr.do_cmp(this.y, cmp, y);
        };
        cnds.IsOnScreen = function ()
        {
            var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;
            return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom);
        };
        cnds.IsOutsideLayout = function ()
        {
            this.update_bbox();
            var bbox = this.bbox;
            var layout = this.runtime.running_layout;
            return (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height);
        };
        cnds.PickDistance = function (which, x, y)
        {
            var sol = this.getCurrentSol();
            var instances = sol.getObjects();
            if (!instances.length)
                return false;
            var inst = instances[0];
            var pickme = inst;
            var dist = cr.distanceTo(inst.x, inst.y, x, y);
            var i, len, d;
            for (i = 1, len = instances.length; i < len; i++)
            {
                inst = instances[i];
                d = cr.distanceTo(inst.x, inst.y, x, y);
                if ((which === 0 && d < dist) || (which === 1 && d > dist))
                {
                    dist = d;
                    pickme = inst;
                }
            }
            sol.pick_one(pickme);
            return true;
        };
        acts.SetX = function (x)
        {
            if (this.x !== x)
            {
                this.x = x;
                this.set_bbox_changed();
            }
        };
        acts.SetY = function (y)
        {
            if (this.y !== y)
            {
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPos = function (x, y)
        {
            if (this.x !== x || this.y !== y)
            {
                this.x = x;
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPosToObject = function (obj, imgpt)
        {
            var inst = obj.getPairedInstance(this);
            if (!inst)
                return;
            var newx, newy;
            if (inst.getImagePoint)
            {
                newx = inst.getImagePoint(imgpt, true);
                newy = inst.getImagePoint(imgpt, false);
            }
            else
            {
                newx = inst.x;
                newy = inst.y;
            }
            if (this.x !== newx || this.y !== newy)
            {
                this.x = newx;
                this.y = newy;
                this.set_bbox_changed();
            }
        };
        acts.MoveForward = function (dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(this.angle) * dist;
                this.y += Math.sin(this.angle) * dist;
                this.set_bbox_changed();
            }
        };
        acts.MoveAtAngle = function (a, dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(cr.to_radians(a)) * dist;
                this.y += Math.sin(cr.to_radians(a)) * dist;
                this.set_bbox_changed();
            }
        };
        exps.X = function (ret)
        {
            ret.set_float(this.x);
        };
        exps.Y = function (ret)
        {
            ret.set_float(this.y);
        };
        exps.dt = function (ret)
        {
            ret.set_float(this.runtime.getDt(this));
        };
    }
    if (size_aces)
    {
        cnds.CompareWidth = function (cmp, w)
        {
            return cr.do_cmp(this.width, cmp, w);
        };
        cnds.CompareHeight = function (cmp, h)
        {
            return cr.do_cmp(this.height, cmp, h);
        };
        acts.SetWidth = function (w)
        {
            if (this.width !== w)
            {
                this.width = w;
                this.set_bbox_changed();
            }
        };
        acts.SetHeight = function (h)
        {
            if (this.height !== h)
            {
                this.height = h;
                this.set_bbox_changed();
            }
        };
        acts.SetSize = function (w, h)
        {
            if (this.width !== w || this.height !== h)
            {
                this.width = w;
                this.height = h;
                this.set_bbox_changed();
            }
        };
        exps.Width = function (ret)
        {
            ret.set_float(this.width);
        };
        exps.Height = function (ret)
        {
            ret.set_float(this.height);
        };
    }
    if (angle_aces)
    {
        cnds.AngleWithin = function (within, a)
        {
            return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within);
        };
        cnds.IsClockwiseFrom = function (a)
        {
            return cr.angleClockwise(this.angle, cr.to_radians(a));
        };
        cnds.IsBetweenAngles = function (a, b)
        {
            var lower = cr.to_clamped_radians(a);
            var upper = cr.to_clamped_radians(b);
            var angle = cr.clamp_angle(this.angle);
            var obtuse = (!cr.angleClockwise(upper, lower));
            if (obtuse)
                return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
            else
                return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
        };
        acts.SetAngle = function (a)
        {
            var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateClockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle += cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateCounterclockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle -= cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardAngle = function (amt, target)
        {
            var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardPosition = function (amt, x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var target = Math.atan2(dy, dx);
            var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.SetTowardPosition = function (x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var newangle = Math.atan2(dy, dx);
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        exps.Angle = function (ret)
        {
            ret.set_float(cr.to_clamped_degrees(this.angle));
        };
    }
    if (!singleglobal_)
    {
        cnds.CompareInstanceVar = function (iv, cmp, val)
        {
            return cr.do_cmp(this.instance_vars[iv], cmp, val);
        };
        cnds.IsBoolInstanceVarSet = function (iv)
        {
            return this.instance_vars[iv];
        };
        cnds.PickByUID = function (u)
        {
            return this.uid === u;
        };
        cnds.OnCreated = function ()
        {
            return true;
        };
        cnds.OnDestroyed = function ()
        {
            return true;
        };
        acts.SetInstanceVar = function (iv, val)
        {
            var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = val.toString();
            }
            else
;
        };
        acts.AddInstanceVar = function (iv, val)
        {
            var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += val.toString();
            }
            else
;
        };
        acts.SubInstanceVar = function (iv, val)
        {
            var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] -= val;
                else
                    myinstvars[iv] -= parseFloat(val);
            }
            else
;
        };
        acts.SetBoolInstanceVar = function (iv, val)
        {
            this.instance_vars[iv] = val ? 1 : 0;
        };
        acts.ToggleBoolInstanceVar = function (iv)
        {
            this.instance_vars[iv] = 1 - this.instance_vars[iv];
        };
        acts.Destroy = function ()
        {
            this.runtime.DestroyInstance(this);
        };
        exps.Count = function (ret)
        {
            var count = ret.object_class.instances.length;
            var i, len, inst;
            for (i = 0, len = this.runtime.createRow.length; i < len; i++)
            {
                inst = this.runtime.createRow[i];
                if (ret.object_class.is_family)
                {
                    if (inst.type.families.indexOf(ret.object_class) >= 0)
                        count++;
                }
                else
                {
                    if (inst.type === ret.object_class)
                        count++;
                }
            }
            ret.set_int(count);
        };
        exps.PickedCount = function (ret)
        {
            ret.set_int(ret.object_class.getCurrentSol().getObjects().length);
        };
        exps.UID = function (ret)
        {
            ret.set_int(this.uid);
        };
        exps.IID = function (ret)
        {
            ret.set_int(this.get_iid());
        };
    }
    if (appearance_aces)
    {
        cnds.IsVisible = function ()
        {
            return this.visible;
        };
        acts.SetVisible = function (v)
        {
            if (!v !== !this.visible)
            {
                this.visible = v;
                this.runtime.redraw = true;
            }
        };
        cnds.CompareOpacity = function (cmp, x)
        {
            return cr.do_cmp(this.opacity * 100, cmp, x);
        };
        acts.SetOpacity = function (x)
        {
            var new_opacity = x / 100.0;
            if (new_opacity < 0)
                new_opacity = 0;
            else if (new_opacity > 1)
                new_opacity = 1;
            if (new_opacity !== this.opacity)
            {
                this.opacity = new_opacity;
                this.runtime.redraw = true;
            }
        };
        exps.Opacity = function (ret)
        {
            ret.set_float(this.opacity * 100.0);
        };
    }
    if (zorder_aces)
    {
        cnds.IsOnLayer = function (layer_)
        {
            if (!layer_)
                return false;
            return this.layer === layer_;
        };
        cnds.PickTopBottom = function (which_)
        {
            var sol = this.getCurrentSol();
            var instances = sol.getObjects();
            if (!instances.length)
                return false;
            var inst = instances[0];
            var pickme = inst;
            var i, len;
            for (i = 1, len = instances.length; i < len; i++)
            {
                inst = instances[i];
                if (which_ === 0)
                {
                    if (inst.layer.index > pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex()))
                    {
                        pickme = inst;
                    }
                }
                else
                {
                    if (inst.layer.index < pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex()))
                    {
                        pickme = inst;
                    }
                }
            }
            sol.pick_one(pickme);
            return true;
        };
        acts.MoveToTop = function ()
        {
            var zindex = this.get_zindex();
            if (zindex === this.layer.instances.length - 1)
                return;
            cr.arrayRemove(this.layer.instances, zindex);
            this.layer.instances.push(this);
            this.runtime.redraw = true;
            this.layer.zindices_stale = true;
        };
        acts.MoveToBottom = function ()
        {
            var zindex = this.get_zindex();
            if (zindex === 0)
                return;
            cr.arrayRemove(this.layer.instances, zindex);
            this.layer.instances.unshift(this);
            this.runtime.redraw = true;
            this.layer.zindices_stale = true;
        };
        acts.MoveToLayer = function (layerMove)
        {
            if (!layerMove || layerMove == this.layer)
                return;
            cr.arrayRemove(this.layer.instances, this.get_zindex());
            this.layer.zindices_stale = true;
            this.layer = layerMove;
            this.zindex = layerMove.instances.length;
            layerMove.instances.push(this);
            this.runtime.redraw = true;
        };
        exps.LayerNumber = function (ret)
        {
            ret.set_int(this.layer.number);
        };
        exps.LayerName = function (ret)
        {
            ret.set_string(this.layer.name);
        };
        exps.ZIndex = function (ret)
        {
            ret.set_int(this.get_zindex());
        };
    }
    if (effects_aces)
    {
        acts.SetEffectEnabled = function (enable_, effectname_)
        {
            if (!this.runtime.glwrap)
                return;
            var i = this.type.getEffectIndexByName(effectname_);
            if (i < 0)
                return;     // effect name not found
            var enable = (enable_ === 1);
            if (this.active_effect_flags[i] === enable)
                return;     // no change
            this.active_effect_flags[i] = enable;
            this.updateActiveEffects();
            this.runtime.redraw = true;
        };
        acts.SetEffectParam = function (effectname_, index_, value_)
        {
            if (!this.runtime.glwrap)
                return;
            var i = this.type.getEffectIndexByName(effectname_);
            if (i < 0)
                return;     // effect name not found
            var et = this.type.effect_types[i];
            var params = this.effect_params[i];
            index_ = Math.floor(index_);
            if (index_ < 0 || index_ >= params.length)
                return;     // effect index out of bounds
            if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
                value_ /= 100.0;
            if (params[index_] === value_)
                return;     // no change
            params[index_] = value_;
            if (et.active)
                this.runtime.redraw = true;
        };
    }
};
cr.set_bbox_changed = function ()
{
    this.bbox_changed = true;       // will recreate next time box requested
    this.runtime.redraw = true;     // assume runtime needs to redraw
    var i, len;
    for (i = 0, len = this.bbox_changed_callbacks.length; i < len; i++)
    {
        this.bbox_changed_callbacks[i](this);
    }
};
cr.add_bbox_changed_callback = function (f)
{
    if (f)
        this.bbox_changed_callbacks.push(f);
};
cr.update_bbox = function ()
{
    if (!this.bbox_changed)
        return;                 // bounding box not changed
    this.bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
    this.bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
    if (!this.angle)
    {
        this.bquad.set_from_rect(this.bbox);    // make bounding quad from box
    }
    else
    {
        this.bbox.offset(-this.x, -this.y);                         // translate to origin
        this.bquad.set_from_rotated_rect(this.bbox, this.angle);    // rotate around origin
        this.bquad.offset(this.x, this.y);                          // translate back to original position
        this.bquad.bounding_box(this.bbox);
    }
    var temp = 0;
    if (this.bbox.left > this.bbox.right)
    {
        temp = this.bbox.left;
        this.bbox.left = this.bbox.right;
        this.bbox.right = temp;
    }
    if (this.bbox.top > this.bbox.bottom)
    {
        temp = this.bbox.top;
        this.bbox.top = this.bbox.bottom;
        this.bbox.bottom = temp;
    }
    this.bbox_changed = false;  // bounding box up to date
};
cr.inst_contains_pt = function (x, y)
{
    if (!this.bbox.contains_pt(x, y))
        return false;
    if (!this.bquad.contains_pt(x, y))
        return false;
    if (this.collision_poly && !this.collision_poly.is_empty())
    {
        this.collision_poly.cache_poly(this.width, this.height, this.angle);
        return this.collision_poly.contains_pt(x - this.x, y - this.y);
    }
    else
        return true;
};
cr.inst_get_iid = function ()
{
    this.type.updateIIDs();
    return this.iid;
};
cr.inst_get_zindex = function ()
{
    this.layer.updateZIndices();
    return this.zindex;
};
cr.inst_updateActiveEffects = function ()
{
    this.active_effect_types.length = 0;
    var i, len, et, inst;
    for (i = 0, len = this.active_effect_flags.length; i < len; i++)
    {
        if (this.active_effect_flags[i])
            this.active_effect_types.push(this.type.effect_types[i]);
    }
    this.uses_shaders = !!this.active_effect_types.length;
};
cr.inst_toString = function ()
{
    return "inst:" + this.type.name + "#" + this.uid;
};
cr.type_getFirstPicked = function ()
{
    var instances = this.getCurrentSol().getObjects();
    if (instances.length)
        return instances[0];
    else
        return null;
};
cr.type_getPairedInstance = function (inst)
{
    var instances = this.getCurrentSol().getObjects();
    if (instances.length)
        return instances[inst.get_iid() % instances.length];
    else
        return null;
};
cr.type_updateIIDs = function ()
{
    if (!this.stale_iids || this.is_family)
        return;     // up to date or is family - don't want family to overwrite IIDs
    var i, len;
    for (i = 0, len = this.instances.length; i < len; i++)
        this.instances[i].iid = i;
    this.stale_iids = false;
};
cr.type_getCurrentSol = function ()
{
    return this.solstack[this.cur_sol];
};
cr.type_pushCleanSol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    else
        this.solstack[this.cur_sol].select_all = true;  // else clear next SOL
};
cr.type_pushCopySol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    var clonesol = this.solstack[this.cur_sol];
    var prevsol = this.solstack[this.cur_sol - 1];
    if (prevsol.select_all)
        clonesol.select_all = true;
    else
    {
        clonesol.select_all = false;
        cr.shallowAssignArray(clonesol.instances, prevsol.instances);
    }
};
cr.type_popSol = function ()
{
;
    this.cur_sol--;
};
cr.type_getBehaviorByName = function (behname)
{
    var i, len, j, lenj, f, index = 0;
    if (!this.is_family)
    {
        for (i = 0, len = this.families.length; i < len; i++)
        {
            f = this.families[i];
            for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
            {
                if (behname === f.behaviors[j].name)
                {
                    this.extra.lastBehIndex = index;
                    return f.behaviors[j];
                }
                index++;
            }
        }
    }
    for (i = 0, len = this.behaviors.length; i < len; i++) {
        if (behname === this.behaviors[i].name)
        {
            this.extra.lastBehIndex = index;
            return this.behaviors[i];
        }
        index++;
    }
    return null;
};
cr.type_getBehaviorIndexByName = function (behname)
{
    var b = this.getBehaviorByName(behname);
    if (b)
        return this.extra.lastBehIndex;
    else
        return -1;
};
cr.type_getEffectIndexByName = function (name_)
{
    var i, len;
    for (i = 0, len = this.effect_types.length; i < len; i++)
    {
        if (this.effect_types[i].name === name_)
            return i;
    }
    return -1;
};
cr.type_toString = function ()
{
    return this.name;
};
cr.do_cmp = function (x, cmp, y)
{
    if (typeof x === "undefined" || typeof y === "undefined")
        return false;
    switch (cmp)
    {
        case 0:     // equal
            return x === y;
        case 1:     // not equal
            return x !== y;
        case 2:     // less
            return x < y;
        case 3:     // less/equal
            return x <= y;
        case 4:     // greater
            return x > y;
        case 5:     // greater/equal
            return x >= y;
        default:
;
            return false;
    }
};
cr.shaders = {};
;
;
cr.plugins_.Audio = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Audio.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    var audRuntime = null;
    var audInst = null;
    var audTag = "";
    var appPath = "";           // for PhoneGap only
    var API_HTML5 = 0;
    var API_WEBAUDIO = 1;
    var API_PHONEGAP = 2;
    var API_APPMOBI = 3;
    var api = API_HTML5;
    var context = null;
    var audioBuffers = [];      // cache of buffers
    var audioInstances = [];    // cache of instances
    var lastAudio = null;
    var useOgg = false;         // determined at create time
    var timescale_mode = 0;
    var silent = false;
    var iOShadtouch = false;    // has had touch input on iOS to work around web audio API muting
    var iOStoplay = [];         // array to call noteOn(0) on when first touch arrives
    function C2AudioBuffer(src_, is_music)
    {
        this.src = src_;
        this.myapi = api;
        this.is_music = is_music;
        this.added_end_listener = false;
        var self = this;
        if (api === API_WEBAUDIO && is_music && !audRuntime.isAwesomium && !audRuntime.isiOS)
            this.myapi = API_HTML5;
        this.bufferObject = null;
        var request;
        switch (this.myapi) {
        case API_HTML5:
            if (is_music && audRuntime.isCocoonJs)
                ext["IDTK_APP"]["makeCall"]("addForceMusic", src_);
            this.bufferObject = new Audio();
            this.bufferObject.autoplay = false; // this is only a source buffer, not an instance
            this.bufferObject.preload = "auto";
            this.bufferObject.src = src_;
            break;
        case API_WEBAUDIO:
            request = new XMLHttpRequest();
            request.open("GET", src_, true);
            request.responseType = "arraybuffer";
            request.onload = function () {
                if (context["decodeAudioData"])
                {
                    context["decodeAudioData"](request.response, function (buffer) {
                            self.bufferObject = buffer;
                            if (!cr.is_undefined(self.playTagWhenReady))
                            {
                                var a = new C2AudioInstance(self, self.playTagWhenReady);
                                a.play(self.loopWhenReady, self.volumeWhenReady);
                                audioInstances.push(a);
                            }
                    });
                }
                else
                {
                    self.bufferObject = context["createBuffer"](request.response, false);
                    if (!cr.is_undefined(self.playTagWhenReady))
                    {
                        var a = new C2AudioInstance(self, self.playTagWhenReady);
                        a.play(self.loopWhenReady, self.volumeWhenReady);
                        audioInstances.push(a);
                    }
                }
            };
            request.send();
            break;
        case API_PHONEGAP:
            this.bufferObject = true;
            break;
        case API_APPMOBI:
            this.bufferObject = true;
            break;
        }
    };
    C2AudioBuffer.prototype.isLoaded = function ()
    {
        switch (this.myapi) {
        case API_HTML5:
            return this.bufferObject["readyState"] === 4;   // HAVE_ENOUGH_DATA
        case API_WEBAUDIO:
            return !!this.bufferObject;         // null until AJAX request completes
        case API_PHONEGAP:
            return true;
        case API_APPMOBI:
            return true;
        }
        return false;
    };
    function C2AudioInstance(buffer_, tag_)
    {
        this.tag = tag_;
        this.fresh = true;
        this.stopped = true;
        this.src = buffer_.src;
        this.buffer = buffer_;
        this.myapi = buffer_.myapi;
        this.is_music = buffer_.is_music;
        this.playbackRate = 1;
        this.pgended = true;            // for PhoneGap only: ended flag
        this.resume_me = false;         // make sure resumes when leaving suspend
        this.looping = false;
        var self = this;
        this.volume = 1;
        this.mutevol = 1;
        this.startTime = audRuntime.kahanTime.sum;
        this.instanceObject = null;
        var add_end_listener = false;
        switch (this.myapi) {
        case API_HTML5:
            if (this.is_music)
            {
                this.instanceObject = buffer_.bufferObject;
                add_end_listener = !buffer_.added_end_listener;
                buffer_.added_end_listener = true;
            }
            else
            {
                this.instanceObject = new Audio();
                this.instanceObject.autoplay = false;
                this.instanceObject.src = buffer_.bufferObject.src;
                add_end_listener = true;
            }
            if (add_end_listener)
            {
                this.instanceObject.addEventListener('ended', function () {
                        audTag = self.tag;
                        self.stopped = true;
                        audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
                });
            }
            break;
        case API_WEBAUDIO:
            if (buffer_.bufferObject)
            {
                this.instanceObject = context["createBufferSource"]();
                this.instanceObject["buffer"] = buffer_.bufferObject;
                this.instanceObject["connect"](context["destination"]);
            }
            break;
        case API_PHONEGAP:
            this.instanceObject = new window["Media"](appPath + this.src, null, null, function (status) {
                    if (status === window["Media"]["MEDIA_STOPPED"])
                    {
                        self.pgended = true;
                        self.stopped = true;
                        audTag = self.tag;
                        audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
                    }
            });
            break;
        case API_APPMOBI:
            this.instanceObject = true;
            break;
        }
    };
    C2AudioInstance.prototype.hasEnded = function ()
    {
        switch (this.myapi) {
        case API_HTML5:
            return this.instanceObject.ended;
        case API_WEBAUDIO:
            if (!this.fresh && !this.stopped && this.instanceObject["loop"])
                return false;
            return (audRuntime.kahanTime.sum - this.startTime) > this.buffer.bufferObject["duration"];
        case API_PHONEGAP:
            return this.pgended;
        case API_APPMOBI:
            true;   // recycling an AppMobi sound does not matter because it will just do another throwaway playSound
        }
        return true;
    };
    C2AudioInstance.prototype.canBeRecycled = function ()
    {
        if (this.fresh || this.stopped)
            return true;        // not yet used or is not playing
        return this.hasEnded();
    };
    C2AudioInstance.prototype.play = function (looping, vol)
    {
        var instobj = this.instanceObject;
        this.looping = looping;
        switch (this.myapi) {
        case API_HTML5:
            if (instobj.playbackRate !== 1.0)
                instobj.playbackRate = 1.0;
            if (instobj.volume !== vol)
                instobj.volume = vol;
            if (instobj.loop !== looping)
                instobj.loop = looping;
            if (instobj.muted)
                instobj.muted = false;
            if (!this.fresh && this.stopped && instobj.currentTime !== 0)
            {
                try {
                    instobj.currentTime = 0;
                }
                catch (err)
                {
;
                }
            }
            this.instanceObject.play();
            break;
        case API_WEBAUDIO:
            this.muted = false;
            this.volume = vol;
            this.mutevol = 1;
            if (audRuntime.isiOS && iOStoplay.length > 3)
                break;
            if (!this.fresh)
            {
                this.instanceObject = context["createBufferSource"]();
                this.instanceObject["buffer"] = this.buffer.bufferObject;
                this.instanceObject["connect"](context["destination"]);
            }
            this.instanceObject.loop = looping;
            this.instanceObject["gain"]["value"] = vol;
            if (audRuntime.isiOS && !iOShadtouch)
                iOStoplay.push(this.instanceObject);
            else
                this.instanceObject["noteOn"](0);
            break;
        case API_PHONEGAP:
            if (!this.fresh && this.stopped)
                instobj["seekTo"](0);
            instobj["play"]();
            this.pgended = false;
            break;
        case API_APPMOBI:
            if (audRuntime.isDirectCanvas)
                AppMobi["context"]["playSound"](this.src);
            else
                AppMobi["player"]["playSound"](this.src);
            break;
        }
        this.playbackRate = 1;
        this.startTime = audRuntime.kahanTime.sum;
        this.fresh = false;
        this.stopped = false;
    };
    C2AudioInstance.prototype.stop = function ()
    {
        switch (this.myapi) {
        case API_HTML5:
            if (!this.instanceObject.paused)
                this.instanceObject.pause();
            break;
        case API_WEBAUDIO:
            this.instanceObject["noteOff"](0);
            break;
        case API_PHONEGAP:
            this.instanceObject["stop"]();
            break;
        case API_APPMOBI:
            break;
        }
        this.stopped = true;
    };
    C2AudioInstance.prototype.setVolume = function (v)
    {
        switch (this.myapi) {
        case API_HTML5:
            if (this.instanceObject.volume && this.instanceObject.volume !== v)
                this.instanceObject.volume = v;
            break;
        case API_WEBAUDIO:
            this.volume = v;
            this.instanceObject["gain"]["value"] = v * this.mutevol;
            break;
        case API_PHONEGAP:
            break;
        case API_APPMOBI:
            break;
        }
    };
    C2AudioInstance.prototype.setMuted = function (m)
    {
        switch (this.myapi) {
        case API_HTML5:
            if (this.instanceObject.muted !== !!m)
                this.instanceObject.muted = !!m;
            break;
        case API_WEBAUDIO:
            this.mutevol = (m ? 0 : 1);
            this.instanceObject["gain"]["value"] = this.volume * this.mutevol;
            break;
        case API_PHONEGAP:
            break;
        case API_APPMOBI:
            break;
        }
    };
    C2AudioInstance.prototype.setLooping = function (l)
    {
        this.looping = l;
        switch (this.myapi) {
        case API_HTML5:
            if (this.instanceObject.loop !== !!l)
                this.instanceObject.loop = !!l;
            break;
        case API_WEBAUDIO:
            if (this.instanceObject.loop !== !!l)
                this.instanceObject.loop = !!l;
            break;
        case API_PHONEGAP:
            break;
        case API_APPMOBI:
            break;
        }
    };
    C2AudioInstance.prototype.setPlaybackRate = function (r)
    {
        this.playbackRate = r;
        this.updatePlaybackRate();
    };
    C2AudioInstance.prototype.updatePlaybackRate = function ()
    {
        var r = this.playbackRate;
        if ((timescale_mode === 1 && !this.is_music) || timescale_mode === 2)
            r *= audRuntime.timescale;
        switch (this.myapi) {
        case API_HTML5:
            if (this.instanceObject.playbackRate !== r)
                this.instanceObject.playbackRate = r;
            break;
        case API_WEBAUDIO:
            if (this.instanceObject["playbackRate"]["value"] !== r)
                this.instanceObject["playbackRate"]["value"] = r;
            break;
        case API_PHONEGAP:
            break;
        case API_APPMOBI:
            break;
        }
    };
    C2AudioInstance.prototype.setSuspended = function (s)
    {
        switch (this.myapi) {
        case API_HTML5:
            if (s)
            {
                if (!this.fresh && !this.stopped)
                {
                    this.instanceObject["pause"]();
                    this.resume_me = true;
                }
                else
                    this.resume_me = false;
            }
            else
            {
                if (this.resume_me)
                    this.instanceObject["play"]();
            }
            break;
        case API_WEBAUDIO:
            if (s)
            {
                if (!this.fresh && !this.stopped)
                {
                    this.instanceObject["noteOff"](0);
                    this.resume_me = true;
                }
                else
                    this.resume_me = false;
            }
            else
            {
                if (this.resume_me)
                {
                    this.instanceObject = context["createBufferSource"]();
                    this.instanceObject["buffer"] = this.buffer.bufferObject;
                    this.instanceObject["connect"](context["destination"]);
                    this.instanceObject.loop = this.looping;
                    this.instanceObject["noteOn"](0);
                }
            }
            break;
        case API_PHONEGAP:
            if (s)
            {
                if (!this.fresh && !this.stopped)
                {
                    this.instanceObject["pause"]();
                    this.resume_me = true;
                }
                else
                    this.resume_me = false;
            }
            else
            {
                if (this.resume_me)
                    this.instanceObject["play"]();
            }
            break;
        case API_APPMOBI:
            break;
        }
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        audRuntime = this.runtime;
        audInst = this;
        context = null;
        if (typeof AudioContext !== "undefined")
        {
            api = API_WEBAUDIO;
            context = new AudioContext();
        }
        else if (typeof webkitAudioContext !== "undefined")
        {
            api = API_WEBAUDIO;
            context = new webkitAudioContext();
        }
        if (this.runtime.isiOS && api === API_WEBAUDIO)
        {
            document.addEventListener("touchstart", function () {
                if (iOShadtouch)
                    return;
                if (iOStoplay.length)
                    iOShadtouch = true;
                var i, len;
                for (i = 0, len = iOStoplay.length; i < len; i++)
                    iOStoplay[i]["noteOn"](0);
                iOStoplay.length = 0;       // GC the buffers
            }, false);
        }
        if (api !== API_WEBAUDIO)
        {
            if (this.runtime.isPhoneGap)
                api = API_PHONEGAP;
            else if (this.runtime.isAppMobi)
                api = API_APPMOBI;
        }
        if (api === API_PHONEGAP)
        {
            appPath = location.href;
            var i = appPath.lastIndexOf("/");
            if (i > -1)
                appPath = appPath.substr(0, i + 1);
            appPath = appPath.replace("file://", "");
        }
        if (this.runtime.isSafari && this.runtime.isWindows && typeof Audio === "undefined")
        {
            alert("It looks like you're using Safari for Windows without Quicktime.  Audio cannot be played until Quicktime is installed.");
            this.runtime.DestroyInstance(this);
        }
        else
        {
            if (this.runtime.isDirectCanvas)
                useOgg = this.runtime.isAndroid;        // AAC on iOS, OGG on Android
            else
                useOgg = !!(new Audio().canPlayType('audio/ogg; codecs="vorbis"'));
            switch (api) {
            case API_HTML5:
;
                break;
            case API_WEBAUDIO:
;
                break;
            case API_PHONEGAP:
;
                break;
            case API_APPMOBI:
;
                break;
            default:
;
            }
            this.runtime.tickMe(this);
        }
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function ()
    {
        timescale_mode = this.properties[0];    // 0 = off, 1 = sounds only, 2 = all
        this.runtime.addSuspendCallback(function(s)
        {
            audInst.onSuspend(s);
        });
    };
    instanceProto.onSuspend = function (s)
    {
        var i, len;
        for (i = 0, len = audioInstances.length; i < len; i++)
            audioInstances[i].setSuspended(s);
    };
    instanceProto.tick = function ()
    {
        var i, len, a;
        for (i = 0, len = audioInstances.length; i < len; i++)
        {
            a = audioInstances[i];
            if (a.myapi !== API_HTML5 && a.myapi !== API_APPMOBI)
            {
                if (!a.fresh && !a.stopped && a.hasEnded())
                {
                    a.stopped = true;
                    audTag = a.tag;
                    audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
                }
            }
            if (timescale_mode !== 0)
                a.updatePlaybackRate();
        }
    };
    instanceProto.getAudioBuffer = function (src_, is_music)
    {
        var i, len, a;
        for (i = 0, len = audioBuffers.length; i < len; i++)
        {
            a = audioBuffers[i];
            if (a.src === src_)
                return a;
        }
        a = new C2AudioBuffer(src_, is_music);
        audioBuffers.push(a);
        return a;
    };
    instanceProto.getAudioInstance = function (src_, tag, is_music, looping, vol)
    {
        var i, len, a;
        for (i = 0, len = audioInstances.length; i < len; i++)
        {
            a = audioInstances[i];
            if (a.src === src_ && a.canBeRecycled())
            {
                a.tag = tag;
                return a;
            }
        }
        var b = this.getAudioBuffer(src_, is_music);
        if (!b.bufferObject)
        {
            if (tag !== "<preload>")
            {
                b.playTagWhenReady = tag;
                b.loopWhenReady = looping;
                b.volumeWhenReady = vol;
            }
            return null;
        }
        a = new C2AudioInstance(b, tag);
        audioInstances.push(a);
        return a;
    };
    var taggedAudio = [];
    instanceProto.getAudioByTag = function (tag)
    {
        taggedAudio.length = 0;
        if (!tag.length)
        {
            if (!lastAudio || lastAudio.hasEnded())
                return;
            else
            {
                taggedAudio.length = 1;
                taggedAudio[0] = lastAudio;
                return;
            }
        }
        var i, len, a;
        for (i = 0, len = audioInstances.length; i < len; i++)
        {
            a = audioInstances[i];
            if (tag.toLowerCase() === a.tag.toLowerCase())
                taggedAudio.push(a);
        }
    };
    function Cnds() {};
    Cnds.prototype.OnEnded = function (t)
    {
        return audTag.toLowerCase() === t.toLowerCase();
    };
    Cnds.prototype.PreloadsComplete = function ()
    {
        var i, len;
        for (i = 0, len = audioBuffers.length; i < len; i++)
        {
            if (!audioBuffers[i].isLoaded())
                return false;
        }
        return true;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.Play = function (file, looping, vol, tag)
    {
        if (silent)
            return;
        var v = Math.pow(10, vol / 20);
        if (v < 0)
            v = 0;
        if (v > 1)
            v = 1;
        var is_music = file[1];
        var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
        lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
        if (!lastAudio)
            return;
        lastAudio.play(looping!==0, v);
    };
    Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag)
    {
        if (silent)
            return;
        var v = Math.pow(10, vol / 20);
        if (v < 0)
            v = 0;
        if (v > 1)
            v = 1;
        var is_music = (folder === 1);
        var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
        lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
        if (!lastAudio)
            return;
        lastAudio.play(looping!==0, v);
    };
    Acts.prototype.SetLooping = function (tag, looping)
    {
        this.getAudioByTag(tag);
        var i, len;
        for (i = 0, len = taggedAudio.length; i < len; i++)
            taggedAudio[i].setLooping(looping === 0);
    };
    Acts.prototype.SetMuted = function (tag, muted)
    {
        this.getAudioByTag(tag);
        var i, len;
        for (i = 0, len = taggedAudio.length; i < len; i++)
            taggedAudio[i].setMuted(muted === 0);
    };
    Acts.prototype.SetVolume = function (tag, vol)
    {
        this.getAudioByTag(tag);
        var v = Math.pow(10, vol / 20);
        if (v < 0)
            v = 0;
        if (v > 1)
            v = 1;
        var i, len;
        for (i = 0, len = taggedAudio.length; i < len; i++)
            taggedAudio[i].setVolume(v);
    };
    Acts.prototype.Preload = function (file)
    {
        if (silent)
            return;
        var is_music = file[1];
        var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
        if (api === API_APPMOBI)
        {
            if (this.runtime.isDirectCanvas)
                AppMobi["context"]["loadSound"](src);
            else
                AppMobi["player"]["loadSound"](src);
            return;
        }
        else if (api === API_PHONEGAP)
        {
            return;
        }
        this.getAudioInstance(src, "<preload>", is_music, false);
    };
    Acts.prototype.PreloadByName = function (folder, filename)
    {
        if (silent)
            return;
        var is_music = (folder === 1);
        var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
        if (api === API_APPMOBI)
        {
            if (this.runtime.isDirectCanvas)
                AppMobi["context"]["loadSound"](src);
            else
                AppMobi["player"]["loadSound"](src);
            return;
        }
        else if (api === API_PHONEGAP)
        {
            return;
        }
        this.getAudioInstance(src, "<preload>", is_music, false);
    };
    Acts.prototype.SetPlaybackRate = function (tag, rate)
    {
        this.getAudioByTag(tag);
        if (rate < 0.0)
            rate = 0;
        var i, len;
        for (i = 0, len = taggedAudio.length; i < len; i++)
            taggedAudio[i].setPlaybackRate(rate);
    };
    Acts.prototype.Stop = function (tag)
    {
        this.getAudioByTag(tag);
        var i, len;
        for (i = 0, len = taggedAudio.length; i < len; i++)
            taggedAudio[i].stop();
    };
    Acts.prototype.SetSilent = function (s)
    {
        var i, len;
        if (s === 2)                    // toggling
            s = (silent ? 1 : 0);       // choose opposite state
        if (s === 0 && !silent)         // setting silent
        {
            for (i = 0, len = audioInstances.length; i < len; i++)
                audioInstances[i].setMuted(true);
            silent = true;
        }
        else if (s === 1 && silent)     // setting not silent
        {
            for (i = 0, len = audioInstances.length; i < len; i++)
                audioInstances[i].setMuted(false);
            silent = false;
        }
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Browser = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Browser.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        var self = this;
        window.addEventListener("resize", function () {
            self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnResize, self);
        });
        if (typeof navigator.onLine !== "undefined")
        {
            window.addEventListener("online", function() {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOnline, self);
            });
            window.addEventListener("offline", function() {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOffline, self);
            });
        }
        if (typeof window.applicationCache !== "undefined")
        {
            window.applicationCache.addEventListener('updateready', function() {
                self.runtime.loadingprogress = 1;
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
            });
            window.applicationCache.addEventListener('progress', function(e) {
                self.runtime.loadingprogress = e["loaded"] / e["total"];
            });
        }
        if (!this.runtime.isDirectCanvas)
        {
            document.addEventListener("appMobi.device.update.available", function() {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
            });
            document.addEventListener("menubutton", function() {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton, self);
            });
            document.addEventListener("searchbutton", function() {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnSearchButton, self);
            });
        }
        this.runtime.addSuspendCallback(function(s) {
            if (s)
            {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageHidden, self);
            }
            else
            {
                self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageVisible, self);
            }
        });
        this.is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
    };
    function Cnds() {};
    Cnds.prototype.CookiesEnabled = function()
    {
        return navigator ? navigator.cookieEnabled : false;
    };
    Cnds.prototype.IsOnline = function()
    {
        return navigator ? navigator.onLine : false;
    };
    Cnds.prototype.HasJava = function()
    {
        return navigator ? navigator.javaEnabled() : false;
    };
    Cnds.prototype.OnOnline = function()
    {
        return true;
    };
    Cnds.prototype.OnOffline = function()
    {
        return true;
    };
    Cnds.prototype.IsDownloadingUpdate = function ()
    {
        if (typeof window["applicationCache"] === "undefined")
            return false;
        else
            return window["applicationCache"]["status"] === window["applicationCache"]["DOWNLOADING"];
    };
    Cnds.prototype.OnUpdateReady = function ()
    {
        return true;
    };
    Cnds.prototype.PageVisible = function ()
    {
        return !this.runtime.isSuspended;
    };
    Cnds.prototype.OnPageVisible = function ()
    {
        return true;
    };
    Cnds.prototype.OnPageHidden = function ()
    {
        return true;
    };
    Cnds.prototype.OnResize = function ()
    {
        return true;
    };
    Cnds.prototype.IsFullscreen = function ()
    {
        return !!(document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.runtime.isAwesomiumFullscreen);
    };
    Cnds.prototype.OnMenuButton = function ()
    {
        return true;
    };
    Cnds.prototype.OnSearchButton = function ()
    {
        return true;
    };
    Cnds.prototype.IsMetered = function ()
    {
        var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
        if (!connection)
            return false;
        return connection["metered"];
    };
    Cnds.prototype.IsCharging = function ()
    {
        var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
        if (!battery)
            return true;
        return battery["charging"];
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.Alert = function (msg)
    {
        if (!this.runtime.isDomFree)
            alert(msg.toString());
    };
    Acts.prototype.Close = function ()
    {
        if (this.runtime.isAwesomium)
            window["c2awesomium"]["close"]();
        else if (!this.is_arcade && !this.runtime.isDomFree)
            window.close();
    };
    Acts.prototype.Focus = function ()
    {
        if (!this.is_arcade && !this.runtime.isDomFree)
            window.focus();
    };
    Acts.prototype.Blur = function ()
    {
        if (!this.is_arcade && !this.runtime.isDomFree)
            window.blur();
    };
    Acts.prototype.GoBack = function ()
    {
        if (!this.is_arcade && !this.runtime.isDomFree)
            window.back();
    };
    Acts.prototype.GoForward = function ()
    {
        if (!this.is_arcade && !this.runtime.isDomFree)
            window.forward();
    };
    Acts.prototype.GoHome = function ()
    {
        if (!this.is_arcade && !this.runtime.isDomFree)
            window.home();
    };
    Acts.prototype.GoToURL = function (url)
    {
        if (this.runtime.isCocoonJs)
            ext["IDTK_APP"]["makeCall"]("loadPath", url);
        else if (!this.is_arcade && !this.runtime.isDomFree)
            window.location = url;
    };
    Acts.prototype.GoToURLWindow = function (url, tag)
    {
        if (this.runtime.isCocoonJs)
            ext["IDTK_APP"]["makeCall"]("loadPath", url);
        else if (!this.is_arcade && !this.runtime.isDomFree)
            window.open(url, tag);
    };
    Acts.prototype.Reload = function ()
    {
        if (!this.is_arcade && !this.runtime.isDomFree)
            window.location.reload();
    };
    Acts.prototype.RequestFullScreen = function (stretchmode)
    {
        if (this.runtime.isDomFree)
        {
            cr.logexport("[Construct 2] Requesting fullscreen is not supported on this platform - the request has been ignored");
            return;
        }
        if (this.runtime.isAwesomium)
        {
            if (!this.runtime.isAwesomiumFullscreen)
            {
                var self = this;
                window["c2OnChangedFullscreen"] = function() {
                    window["c2resizestretchmode"] = (stretchmode > 0 ? 1 : 0);
                    self.runtime.fullscreen_scaling = (stretchmode >= 2 ? stretchmode : 0);
                    self.runtime.fullscreen_mode_set = stretchmode;
                    self.runtime.isAwesomiumFullscreen = true;
                    self.runtime["setSize"](window["c2awesomium"]["screenwidth"], window["c2awesomium"]["screenheight"]);
                };
                window["c2awesomium"]["goFullscreen"]();
            }
        }
        else
        {
            if (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"])
                return;
            window["c2resizestretchmode"] = (stretchmode > 0 ? 1 : 0);
            this.runtime.fullscreen_scaling = (stretchmode >= 2 ? stretchmode : 0);
            var elem = this.runtime.canvasdiv || this.runtime.canvas;
            if (!cr.is_undefined(elem["webkitRequestFullScreen"]))
            {
                if (typeof Element !== "undefined" && typeof Element["ALLOW_KEYBOARD_INPUT"] !== "undefined")
                    elem["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
                else
                    elem["webkitRequestFullScreen"]();
            }
            else if (!cr.is_undefined(elem["mozRequestFullScreen"]))
                elem["mozRequestFullScreen"]();
            else if (!cr.is_undefined(elem["requestFullscreen"]))
                elem["requestFullscreen"]();
        }
    };
    Acts.prototype.CancelFullScreen = function ()
    {
        if (this.runtime.isDomFree)
        {
            cr.logexport("[Construct 2] Exiting fullscreen is not supported on this platform - the request has been ignored");
            return;
        }
        if (this.runtime.isAwesomium)
        {
            if (this.runtime.isAwesomiumFullscreen)
            {
                var self = this;
                window["c2OnChangedWindowed"] = function() {
                    window["c2resizestretchmode"] = 0;
                    self.runtime.fullscreen_scaling = 0;
                    self.runtime.fullscreen_mode_set = 0;
                    self.runtime.isAwesomiumFullscreen = false;
                    self.runtime["setSize"](self.runtime.original_width, self.runtime.original_height);
                };
                window["c2awesomium"]["exitFullscreen"]();
            }
        }
        else
        {
            if (!cr.is_undefined(document["webkitCancelFullScreen"]))
                document["webkitCancelFullScreen"]();
            if (!cr.is_undefined(document["mozCancelFullScreen"]))
                document["mozCancelFullScreen"]();
            if (!cr.is_undefined(document["exitFullscreen"]))
                document["exitFullscreen"]();
        }
    };
    Acts.prototype.Vibrate = function (pattern_)
    {
        try {
            var arr = pattern_.split(",");
            var i, len;
            for (i = 0, len = arr.length; i < len; i++)
            {
                arr[i] = parseInt(arr[i], 10);
            }
            var vibrate = navigator["mozVibrate"] || navigator["webkitVibrate"] || navigator["vibrate"];
            if (vibrate)
                vibrate(arr);
        }
        catch (e) {}
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.URL = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : window.location.toString());
    };
    Exps.prototype.Protocol = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : window.location.protocol);
    };
    Exps.prototype.Domain = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : window.location.hostname);
    };
    Exps.prototype.PathName = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : window.location.pathname);
    };
    Exps.prototype.Hash = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : window.location.hash);
    };
    Exps.prototype.Referrer = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : document.referrer);
    };
    Exps.prototype.Title = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : document.title);
    };
    Exps.prototype.Name = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : navigator.appName);
    };
    Exps.prototype.Version = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : navigator.appVersion);
    };
    Exps.prototype.Language = function (ret)
    {
        if (navigator && navigator.language)
            ret.set_string(navigator.language);
        else
            ret.set_string("");
    };
    Exps.prototype.Platform = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : navigator.platform);
    };
    Exps.prototype.Product = function (ret)
    {
        if (navigator && navigator.product)
            ret.set_string(navigator.product);
        else
            ret.set_string("");
    };
    Exps.prototype.Vendor = function (ret)
    {
        if (navigator && navigator.vendor)
            ret.set_string(navigator.vendor);
        else
            ret.set_string("");
    };
    Exps.prototype.UserAgent = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : navigator.userAgent);
    };
    Exps.prototype.QueryString = function (ret)
    {
        ret.set_string(this.runtime.isDomFree ? "" : window.location.search);
    };
    Exps.prototype.QueryParam = function (ret, paramname)
    {
        if (this.runtime.isDomFree)
        {
            ret.set_string("");
            return;
        }
        var match = RegExp('[?&]' + paramname + '=([^&]*)').exec(window.location.search);
        if (match)
            ret.set_string(decodeURIComponent(match[1].replace(/\+/g, ' ')));
        else
            ret.set_string("");
    };
    Exps.prototype.Bandwidth = function (ret)
    {
        var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
        if (!connection)
            ret.set_float(Number.POSITIVE_INFINITY);
        else
            ret.set_float(connection["bandwidth"]);
    };
    Exps.prototype.BatteryLevel = function (ret)
    {
        var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
        if (!battery)
            ret.set_float(1);
        else
            ret.set_float(battery["level"]);
    };
    Exps.prototype.BatteryTimeLeft = function (ret)
    {
        var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
        if (!battery)
            ret.set_float(Number.POSITIVE_INFINITY);
        else
            ret.set_float(battery["dischargingTime"]);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.CJSAds = function(runtime)
{
    this.runtime = runtime;
};
(function() {
    if (typeof CocoonJS === 'undefined')
        window.CocoonJS= {};
    CocoonJS.AdController = {};
    CocoonJS.AdController.Layout = {
        TOP_CENTER      : "TOP_CENTER",
        BOTTOM_CENTER   : "BOTTOM_CENTER"
    };
    CocoonJS.AdController.available = (typeof ext !== 'undefined');
    CocoonJS.AdController.init = function(params)
    {
        if ( !CocoonJS.AdController.available ) {
            return;
        }
        if ( typeof params==='undefined' ) {
            return;
        }
        if ( typeof params.preloadFullScreen!=='undefined' ) {
            ext["IDTK_SRV_AD"]["makeCall"]("preloadFullScreen");
        }
        if ( typeof params.preloadBanner!=='undefined' ) {
            ext["IDTK_SRV_AD"]["makeCall"]("preloadBanner");
        }
        return CocoonJS.AdController;
    };
    CocoonJS.AdController.addEventListener= function( fn, callback )
    {
        if ( !CocoonJS.AdController.available ) {
            return this;
        }
        ext["IDTK_SRV_AD"].addEventListener( fn, callback );
        return CocoonJS.AdController;
    };
    CocoonJS.AdController.removeEventListener= function( callback )
    {
        if ( !CocoonJS.AdController.available ) {
            return this;
        }
        ext["IDTK_SRV_AD"].removeEventListener( callback );
        return CocoonJS.AdController;
    };
    CocoonJS.AdController.setBannerLayout= function( layout )
    {
        if ( !CocoonJS.AdController.available ) {
            return this;
        }
        ext["IDTK_SRV_AD"]["makeCall"]("setBannerLayout", layout);
        return CocoonJS.AdController;
    };
    CocoonJS.AdController.showBanner= function()
    {
        if ( !CocoonJS.AdController.available ) {
            return this;
        }
        ext["IDTK_SRV_AD"]["makeCall"]("showBanner");
        return CocoonJS.AdController;
    }
    CocoonJS.AdController.hideBanner= function()
    {
        if ( !CocoonJS.AdController.available ) {
            return this;
        }
        ext["IDTK_SRV_AD"]["makeCall"]("hideBanner");
        return CocoonJS.AdController;
    }
    CocoonJS.AdController.showFullscreen= function()
    {
        if ( !CocoonJS.AdController.available ) {
            return this;
        }
        ext["IDTK_SRV_AD"]["makeCall"]("showFullScreen");
        return CocoonJS.AdController;
    }
})();
(function ()
{
    var pluginProto = cr.plugins_.CJSAds.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        this.isShowingBanner = false;
    };
    function Cnds() {};
    Cnds.prototype.IsShowingBanner = function ()
    {
        return this.isShowingBanner;
    };
    Cnds.prototype.IsAvailable = function ()
    {
        return CocoonJS.AdController.available;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.ShowBanner = function (layout_)
    {
        if (!CocoonJS.AdController.available)
            return;
        CocoonJS.AdController.setBannerLayout(layout_ === 0 ? CocoonJS.AdController.Layout.TOP_CENTER : CocoonJS.AdController.Layout.BOTTOM_CENTER);
        CocoonJS.AdController.showBanner();
        this.isShowingBanner = true;
    };
    Acts.prototype.ShowFullscreen = function ()
    {
        CocoonJS.AdController.showFullscreen();
    };
    Acts.prototype.HideBanner = function ()
    {
        CocoonJS.AdController.hideBanner();
        this.isShowingBanner = false;
    };
    pluginProto.acts = new Acts();
}());
;
;
cr.plugins_.Keyboard = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Keyboard.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.keyMap = new Array(256);   // stores key up/down state
        this.usedKeys = new Array(256);
        this.triggerKey = 0;
        this.eventRan = false;
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        if (!this.runtime.isDomFree)
        {
            jQuery(document).keydown(
                (function (self) {
                    return function(info) {
                        self.onKeyDown(info);
                    };
                })(this)
            );
            jQuery(document).keyup(
                (function (self) {
                    return function(info) {
                        self.onKeyUp(info);
                    };
                })(this)
            );
        }
    };
    instanceProto.onKeyDown = function (info)
    {
        if (this.keyMap[info.which])
        {
            if (this.usedKeys[info.which])
                info.preventDefault();
            return;
        }
        this.keyMap[info.which] = true;
        this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKey, this);
        this.triggerKey = info.which;
        this.eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKey, this);
        if (this.eventRan)
        {
            this.usedKeys[info.which] = true;
            info.preventDefault();
        }
    };
    instanceProto.onKeyUp = function (info)
    {
        this.keyMap[info.which] = false;
        this.triggerKey = info.which;
        this.eventRan = false;
        this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased, this);
        if (this.eventRan || this.usedKeys[info.which])
        {
            this.usedKeys[info.which] = true;
            info.preventDefault();
        }
    };
    function Cnds() {};
    Cnds.prototype.IsKeyDown = function(key)
    {
        return this.keyMap[key];
    };
    Cnds.prototype.OnKey = function(key)
    {
        return (key === this.triggerKey);
    };
    Cnds.prototype.OnAnyKey = function(key)
    {
        return true;
    };
    Cnds.prototype.OnKeyReleased = function(key)
    {
        var ret = (key === this.triggerKey);
        this.eventRan = this.eventRan || ret;
        return ret;
    };
    pluginProto.cnds = new Cnds();
}());
;
;
cr.plugins_.Particles = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Particles.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
        if (this.is_family)
            return;
        this.texture_img = new Image();
        this.texture_img.src = this.texture_file;
        this.texture_img.cr_filesize = this.texture_filesize;
        this.webGL_texture = null;
        this.runtime.wait_for_textures.push(this.texture_img);
    };
    typeProto.onLostWebGLContext = function ()
    {
        if (this.is_family)
            return;
        this.webGL_texture = null;
    };
    typeProto.onRestoreWebGLContext = function ()
    {
        if (this.is_family || !this.instances.length)
            return;
        if (!this.webGL_texture)
            this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling);
    };
    typeProto.unloadTextures = function ()
    {
        if (this.is_family || this.instances.length)
            return;
        if (this.runtime.glwrap)        // webGL renderer
        {
            if (this.webGL_texture)
            {
                this.runtime.glwrap.deleteTexture(this.webGL_texture);
                this.webGL_texture = null;
            }
        }
        else
        {
            if (this.texture_img["hintUnload"])
                this.texture_img["hintUnload"]();
        }
    };
    function Particle(owner)
    {
        this.owner = owner;
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.angle = 0;
        this.opacity = 1;
        this.grow = 0;
        this.size = 0;
        this.gs = 0;            // gravity speed
        this.age = 0;
        cr.seal(this);
    };
    Particle.prototype.init = function ()
    {
        var owner = this.owner;
        this.x = owner.x - (owner.xrandom / 2) + (Math.random() * owner.xrandom);
        this.y = owner.y - (owner.yrandom / 2) + (Math.random() * owner.yrandom);
        this.speed = owner.initspeed - (owner.speedrandom / 2) + (Math.random() * owner.speedrandom);
        this.angle = owner.angle - (owner.spraycone / 2) + (Math.random() * owner.spraycone);
        this.opacity = owner.initopacity;
        this.size = owner.initsize - (owner.sizerandom / 2) + (Math.random() * owner.sizerandom);
        this.grow = owner.growrate - (owner.growrandom / 2) + (Math.random() * owner.growrandom);
        this.gs = 0;
        this.age = 0;
    };
    Particle.prototype.tick = function (dt)
    {
        var owner = this.owner;
        this.x += Math.cos(this.angle) * this.speed * dt;
        this.y += Math.sin(this.angle) * this.speed * dt;
        this.y += this.gs * dt;
        this.speed += owner.acc * dt;
        this.size += this.grow * dt;
        this.gs += owner.g * dt;
        this.age += dt;
        if (this.size < 1)
        {
            this.active = false;
            return;
        }
        if (owner.lifeanglerandom !== 0)
            this.angle += (Math.random() * owner.lifeanglerandom * dt) - (owner.lifeanglerandom * dt / 2);
        if (owner.lifespeedrandom !== 0)
            this.speed += (Math.random() * owner.lifespeedrandom * dt) - (owner.lifespeedrandom * dt / 2);
        if (owner.lifeopacityrandom !== 0)
        {
            this.opacity += (Math.random() * owner.lifeopacityrandom * dt) - (owner.lifeopacityrandom * dt / 2);
            if (this.opacity < 0)
                this.opacity = 0;
            else if (this.opacity > 1)
                this.opacity = 1;
        }
        if (owner.destroymode <= 1 && this.age >= owner.timeout)
        {
            this.active = false;
        }
        if (owner.destroymode === 2 && this.speed <= 0)
        {
            this.active = false;
        }
    };
    Particle.prototype.draw = function (ctx)
    {
        var curopacity = this.owner.opacity * this.opacity;
        if (curopacity === 0)
            return;
        if (this.owner.destroymode === 0)
            curopacity *= 1 - (this.age / this.owner.timeout);
        ctx.globalAlpha = curopacity;
        var drawx = this.x - this.size / 2;
        var drawy = this.y - this.size / 2;
        if (this.owner.runtime.pixel_rounding)
        {
            drawx = (drawx + 0.5) | 0;
            drawy = (drawy + 0.5) | 0;
        }
        ctx.drawImage(this.owner.type.texture_img, drawx, drawy, this.size, this.size);
    };
    Particle.prototype.drawGL = function (glw)
    {
        var curopacity = this.owner.opacity * this.opacity;
        if (this.owner.destroymode === 0)
            curopacity *= 1 - (this.age / this.owner.timeout);
        var drawsize = this.size;
        var scaleddrawsize = drawsize * this.owner.particlescale;
        var drawx = this.x - drawsize / 2;
        var drawy = this.y - drawsize / 2;
        if (this.owner.runtime.pixel_rounding)
        {
            drawx = (drawx + 0.5) | 0;
            drawy = (drawy + 0.5) | 0;
        }
        if (scaleddrawsize < 1 || curopacity === 0)
            return;
        if (scaleddrawsize < glw.minPointSize || scaleddrawsize > glw.maxPointSize)
        {
            glw.setOpacity(curopacity);
            glw.quad(drawx, drawy, drawx + drawsize, drawy, drawx + drawsize, drawy + drawsize, drawx, drawy + drawsize);
        }
        else
            glw.point(this.x, this.y, scaleddrawsize, curopacity);
    };
    Particle.prototype.left = function ()
    {
        return this.x - this.size / 2;
    };
    Particle.prototype.right = function ()
    {
        return this.x + this.size / 2;
    };
    Particle.prototype.top = function ()
    {
        return this.y - this.size / 2;
    };
    Particle.prototype.bottom = function ()
    {
        return this.y + this.size / 2;
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        var props = this.properties;
        this.rate = props[0];
        this.spraycone = cr.to_radians(props[1]);
        this.spraytype = props[2];          // 0 = continuous, 1 = one-shot
        this.spraying = true;               // for continuous mode only
        this.initspeed = props[3];
        this.initsize = props[4];
        this.initopacity = props[5] / 100.0;
        this.growrate = props[6];
        this.xrandom = props[7];
        this.yrandom = props[8];
        this.speedrandom = props[9];
        this.sizerandom = props[10];
        this.growrandom = props[11];
        this.acc = props[12];
        this.g = props[13];
        this.lifeanglerandom = props[14];
        this.lifespeedrandom = props[15];
        this.lifeopacityrandom = props[16];
        this.destroymode = props[17];       // 0 = fade, 1 = timeout, 2 = stopped
        this.timeout = props[18];
        this.particleCreateCounter = 0;
        this.particlecount = 0;
        this.particlescale = 1;
        this.particleBoxLeft = this.x;
        this.particleBoxTop = this.y;
        this.particleBoxRight = this.x;
        this.particleBoxBottom = this.y;
        this.add_bbox_changed_callback(function (self) {
            self.bbox.set(self.particleBoxLeft, self.particleBoxTop, self.particleBoxRight, self.particleBoxBottom);
            self.bquad.set_from_rect(self.bbox);
            self.bbox_changed = false;
        });
        if (this.particles)
        {
            this.deadparticles.push.apply(this.deadparticles, this.particles);
            this.particles.length = 0;
        }
        else
        {
            this.particles = [];
            this.deadparticles = [];            // for recycling individual particles
        }
        this.runtime.tickMe(this);
        if (this.runtime.glwrap)
        {
            if (!this.type.webGL_texture)
                this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, true, this.runtime.linearSampling);
        }
        else
        {
            if (this.type.texture_img["hintLoad"])
                this.type.texture_img["hintLoad"]();
        }
        if (this.spraytype === 1)
        {
            for (var i = 0; i < this.rate; i++)
                this.allocateParticle().opacity = 0;
        }
        this.first_tick = true;     // for re-init'ing one-shot particles on first tick so they assume any new angle/position
    };
    instanceProto.allocateParticle = function ()
    {
        var p;
        if (this.deadparticles.length)
            p = this.deadparticles.pop();
        else
            p = new Particle(this);
        this.particles.push(p);
        p.active = true;
        return p;
    };
    instanceProto.tick = function()
    {
        var dt = this.runtime.getDt(this);
        var i, len, p, n, j;
        if (this.spraytype === 0 && this.spraying)
        {
            this.particleCreateCounter += dt * this.rate;
            n = cr.floor(this.particleCreateCounter);
            this.particleCreateCounter -= n;
            for (i = 0; i < n; i++)
            {
                p = this.allocateParticle();
                p.init();
            }
        }
        this.particlecount = 0;
        this.particleBoxLeft = this.x;
        this.particleBoxTop = this.y;
        this.particleBoxRight = this.x;
        this.particleBoxBottom = this.y;
        for (i = 0, j = 0, len = this.particles.length; i < len; i++)
        {
            p = this.particles[i];
            this.particles[j] = p;
            this.runtime.redraw = true;
            if (this.spraytype === 1 && this.first_tick)
                p.init();
            p.tick(dt);
            if (!p.active)
            {
                this.deadparticles.push(p);
                continue;
            }
            if (p.left() < this.particleBoxLeft)
                this.particleBoxLeft = p.left();
            if (p.right() > this.particleBoxRight)
                this.particleBoxRight = p.right();
            if (p.top() < this.particleBoxTop)
                this.particleBoxTop = p.top();
            if (p.bottom() > this.particleBoxBottom)
                this.particleBoxBottom = p.bottom();
            this.particlecount++;
            j++;
        }
        this.particles.length = j;
        this.set_bbox_changed();
        this.first_tick = false;
        if (this.spraytype === 1 && this.particlecount === 0)
            this.runtime.DestroyInstance(this);
    };
    instanceProto.draw = function (ctx)
    {
        var i, len, p, layer = this.layer;
        for (i = 0, len = this.particles.length; i < len; i++)
        {
            p = this.particles[i];
            if (p.right() >= layer.viewLeft && p.bottom() >= layer.viewTop && p.left() <= layer.viewRight && p.top() <= layer.viewBottom)
            {
                p.draw(ctx);
            }
        }
    };
    instanceProto.drawGL = function (glw)
    {
        this.particlescale = this.layer.getScale();
        glw.setTexture(this.type.webGL_texture);
        var i, len, p, layer = this.layer;
        for (i = 0, len = this.particles.length; i < len; i++)
        {
            p = this.particles[i];
            if (p.right() >= layer.viewLeft && p.bottom() >= layer.viewTop && p.left() <= layer.viewRight && p.top() <= layer.viewBottom)
            {
                p.drawGL(glw);
            }
        }
    };
    function Cnds() {};
    Cnds.prototype.IsSpraying = function ()
    {
        return this.spraying;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetSpraying = function (set_)
    {
        this.spraying = (set_ !== 0);
    };
    Acts.prototype.SetEffect = function (effect)
    {
        this.compositeOp = cr.effectToCompositeOp(effect);
        cr.setGLBlend(this, effect, this.runtime.gl);
        this.runtime.redraw = true;
    };
    Acts.prototype.SetRate = function (x)
    {
        this.rate = x;
    };
    Acts.prototype.SetSprayCone = function (x)
    {
        this.spraycone = cr.to_radians(x);
    };
    Acts.prototype.SetInitSpeed = function (x)
    {
        this.initspeed = x;
    };
    Acts.prototype.SetInitSize = function (x)
    {
        this.initsize = x;
    };
    Acts.prototype.SetInitOpacity = function (x)
    {
        this.initopacity = x / 100;
    };
    Acts.prototype.SetGrowRate = function (x)
    {
        this.growrate = x;
    };
    Acts.prototype.SetXRandomiser = function (x)
    {
        this.xrandom = x;
    };
    Acts.prototype.SetYRandomiser = function (x)
    {
        this.yrandom = x;
    };
    Acts.prototype.SetSpeedRandomiser = function (x)
    {
        this.speedrandom = x;
    };
    Acts.prototype.SetSizeRandomiser = function (x)
    {
        this.sizerandom = x;
    };
    Acts.prototype.SetGrowRateRandomiser = function (x)
    {
        this.growrandom = x;
    };
    Acts.prototype.SetParticleAcc = function (x)
    {
        this.acc = x;
    };
    Acts.prototype.SetGravity = function (x)
    {
        this.g = x;
    };
    Acts.prototype.SetAngleRandomiser = function (x)
    {
        this.lifeanglerandom = x;
    };
    Acts.prototype.SetSpeedRandomiser = function (x)
    {
        this.lifespeedrandom = x;
    };
    Acts.prototype.SetOpacityRandomiser = function (x)
    {
        this.lifeopacityrandom = x;
    };
    Acts.prototype.SetTimeout = function (x)
    {
        this.timeout = x;
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.ParticleCount = function (ret)
    {
        ret.set_int(this.particlecount);
    };
    Exps.prototype.Rate = function (ret)
    {
        ret.set_float(this.rate);
    };
    Exps.prototype.SprayCone = function (ret)
    {
        ret.set_float(cr.to_degrees(this.spraycone));
    };
    Exps.prototype.InitSpeed = function (ret)
    {
        ret.set_float(this.initspeed);
    };
    Exps.prototype.InitSize = function (ret)
    {
        ret.set_float(this.initsize);
    };
    Exps.prototype.InitOpacity = function (ret)
    {
        ret.set_float(this.initopacity * 100);
    };
    Exps.prototype.InitGrowRate = function (ret)
    {
        ret.set_float(this.growrate);
    };
    Exps.prototype.XRandom = function (ret)
    {
        ret.set_float(this.xrandom);
    };
    Exps.prototype.YRandom = function (ret)
    {
        ret.set_float(this.yrandom);
    };
    Exps.prototype.InitSpeedRandom = function (ret)
    {
        ret.set_float(this.speedrandom);
    };
    Exps.prototype.InitSizeRandom = function (ret)
    {
        ret.set_float(this.sizerandom);
    };
    Exps.prototype.InitGrowRandom = function (ret)
    {
        ret.set_float(this.growrandom);
    };
    Exps.prototype.ParticleAcceleration = function (ret)
    {
        ret.set_float(this.acc);
    };
    Exps.prototype.Gravity = function (ret)
    {
        ret.set_float(this.g);
    };
    Exps.prototype.ParticleAngleRandom = function (ret)
    {
        ret.set_float(this.lifeanglerandom);
    };
    Exps.prototype.ParticleSpeedRandom = function (ret)
    {
        ret.set_float(this.lifespeedrandom);
    };
    Exps.prototype.ParticleOpacityRandom = function (ret)
    {
        ret.set_float(this.lifeopacityrandom);
    };
    Exps.prototype.Timeout = function (ret)
    {
        ret.set_float(this.timeout);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Sprite = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Sprite.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    function frame_getDataUri()
    {
        if (this.datauri.length === 0)
        {
            var tmpcanvas = document.createElement("canvas");
            tmpcanvas.width = this.width;
            tmpcanvas.height = this.height;
            var tmpctx = tmpcanvas.getContext("2d");
            if (this.spritesheeted)
            {
                tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
                                         0, 0, this.width, this.height);
            }
            else
            {
                tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
            }
            this.datauri = tmpcanvas.toDataURL("image/png");
        }
        return this.datauri;
    };
    typeProto.onCreate = function()
    {
        if (this.is_family)
            return;
        var i, leni, j, lenj;
        var anim, frame, animobj, frameobj, wt, uv;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            animobj = {};
            animobj.name = anim[0];
            animobj.speed = anim[1];
            animobj.loop = anim[2];
            animobj.repeatcount = anim[3];
            animobj.repeatto = anim[4];
            animobj.pingpong = anim[5];
            animobj.frames = [];
            for (j = 0, lenj = anim[6].length; j < lenj; j++)
            {
                frame = anim[6][j];
                frameobj = {};
                frameobj.texture_file = frame[0];
                frameobj.texture_filesize = frame[1];
                frameobj.offx = frame[2];
                frameobj.offy = frame[3];
                frameobj.width = frame[4];
                frameobj.height = frame[5];
                frameobj.duration = frame[6];
                frameobj.hotspotX = frame[7];
                frameobj.hotspotY = frame[8];
                frameobj.image_points = frame[9];
                frameobj.poly_pts = frame[10];
                frameobj.spritesheeted = (frameobj.width !== 0);
                frameobj.datauri = "";      // generated on demand and cached
                frameobj.getDataUri = frame_getDataUri;
                uv = {};
                uv.left = 0;
                uv.top = 0;
                uv.right = 1;
                uv.bottom = 1;
                frameobj.sheetTex = uv;
                frameobj.webGL_texture = null;
                wt = this.runtime.findWaitingTexture(frame[0]);
                if (wt)
                {
                    frameobj.texture_img = wt;
                }
                else
                {
                    frameobj.texture_img = new Image();
                    frameobj.texture_img.src = frame[0];
                    frameobj.texture_img.cr_filesize = frame[1];
                    frameobj.texture_img.c2webGL_texture = null;
                    this.runtime.wait_for_textures.push(frameobj.texture_img);
                }
                cr.seal(frameobj);
                animobj.frames.push(frameobj);
            }
            cr.seal(animobj);
            this.animations[i] = animobj;       // swap array data for object
        }
    };
    typeProto.onLostWebGLContext = function ()
    {
        if (this.is_family)
            return;
        var i, leni, j, lenj;
        var anim, frame, inst;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                frame.texture_img.c2webGL_texture = null;
                frame.webGL_texture = null;
            }
        }
    };
    typeProto.onRestoreWebGLContext = function ()
    {
        if (this.is_family || !this.instances.length)
            return;
        var i, leni, j, lenj;
        var anim, frame, inst;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                if (!frame.texture_img.c2webGL_texture)
                    frame.texture_img.c2webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling);
                frame.webGL_texture = frame.texture_img.c2webGL_texture;
            }
        }
        for (i = 0, leni = this.instances.length; i < leni; i++)
        {
            inst = this.instances[i];
            inst.curWebGLTexture = inst.curFrame.webGL_texture;
        }
    };
    var all_my_textures = [];
    typeProto.unloadTextures = function ()
    {
        if (this.is_family || this.instances.length)
            return;
        var isWebGL = !!this.runtime.glwrap;
        var i, leni, j, lenj, k;
        var anim, frame, inst, o;
        all_my_textures.length = 0;
        for (i = 0, leni = this.animations.length; i < leni; i++)
        {
            anim = this.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                o = (isWebGL ? frame.texture_img.c2webGL_texture : frame.texture_img);
                k = all_my_textures.indexOf(o);
                if (k === -1)
                    all_my_textures.push(o);
                frame.texture_img.c2webGL_texture = null;
                frame.webGL_texture = null;
            }
        }
        for (i = 0, leni = all_my_textures.length; i < leni; i++)
        {
            o = all_my_textures[i];
            if (isWebGL)
                this.runtime.glwrap.deleteTexture(o);
            else if (o["hintUnload"])
                o["hintUnload"]();
        }
        all_my_textures.length = 0;
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.collision_poly = new cr.CollisionPoly(this.type.animations[0].frames[0].poly_pts);
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        this.visible = (this.properties[0] === 0);  // 0=visible, 1=invisible
        this.isTicking = false;
        this.inAnimTrigger = false;
        if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
        this.cur_animation = this.type.animations[0];
        this.cur_frame = this.properties[1];
        if (this.cur_frame < 0)
            this.cur_frame = 0;
        if (this.cur_frame >= this.cur_animation.frames.length)
            this.cur_frame = this.cur_animation.frames.length - 1;
        if (this.cur_frame !== 0)
        {
            var curanimframe = this.cur_animation.frames[this.cur_frame];
            this.collision_poly.set_pts(curanimframe.poly_pts);
            this.hotspotX = curanimframe.hotspotX;
            this.hotspotY = curanimframe.hotspotY;
        }
        this.cur_anim_speed = this.type.animations[0].speed;
        this.frameStart = this.getNowTime();
        this.animPlaying = true;
        this.animRepeats = 0;
        this.animForwards = true;
        this.animTriggerName = "";
        this.changeAnimName = "";
        this.changeAnimFrom = 0;
        this.changeAnimFrame = -1;
        var i, leni, j, lenj;
        var anim, frame, uv, maintex;
        for (i = 0, leni = this.type.animations.length; i < leni; i++)
        {
            anim = this.type.animations[i];
            for (j = 0, lenj = anim.frames.length; j < lenj; j++)
            {
                frame = anim.frames[j];
                if (frame.texture_img["hintLoad"])
                    frame.texture_img["hintLoad"]();
                if (frame.width === 0)
                {
                    frame.width = frame.texture_img.width;
                    frame.height = frame.texture_img.height;
                }
                if (frame.spritesheeted)
                {
                    maintex = frame.texture_img;
                    uv = frame.sheetTex;
                    uv.left = frame.offx / maintex.width;
                    uv.top = frame.offy / maintex.height;
                    uv.right = (frame.offx + frame.width) / maintex.width;
                    uv.bottom = (frame.offy + frame.height) / maintex.height;
                    if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height)
                    {
                        frame.spritesheeted = false;
                    }
                }
                if (this.runtime.glwrap)
                {
                    if (!frame.texture_img.c2webGL_texture)
                    {
                        frame.texture_img.c2webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling);
                    }
                    frame.webGL_texture = frame.texture_img.c2webGL_texture;
                }
            }
        }
        this.curFrame = this.cur_animation.frames[this.cur_frame];
        this.curWebGLTexture = this.curFrame.webGL_texture;
    };
    instanceProto.animationFinish = function (reverse)
    {
        this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
        this.animPlaying = false;
        this.animTriggerName = this.cur_animation.name;
        this.inAnimTrigger = true;
        this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
        this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
        this.inAnimTrigger = false;
        this.animRepeats = 0;
    };
    instanceProto.getNowTime = function()
    {
        return (Date.now() - this.runtime.start_time) / 1000.0;
    };
    instanceProto.tick = function()
    {
        if (this.changeAnimName.length)
            this.doChangeAnim();
        if (this.changeAnimFrame >= 0)
            this.doChangeAnimFrame();
        var now = this.getNowTime();
        var cur_animation = this.cur_animation;
        var prev_frame = cur_animation.frames[this.cur_frame];
        var next_frame;
        var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
        var cur_timescale = this.runtime.timescale;
        if (this.my_timescale !== -1.0)
            cur_timescale = this.my_timescale;
        cur_frame_time /= (cur_timescale === 0 ? 0.000000001 : cur_timescale);
        if (this.animPlaying && now >= this.frameStart + cur_frame_time)
        {
            if (this.animForwards)
            {
                this.cur_frame++;
            }
            else
            {
                this.cur_frame--;
            }
            this.frameStart += cur_frame_time;
            if (this.cur_frame >= cur_animation.frames.length)
            {
                if (cur_animation.pingpong)
                {
                    this.animForwards = false;
                    this.cur_frame = cur_animation.frames.length - 2;
                }
                else if (cur_animation.loop)
                {
                    this.cur_frame = cur_animation.repeatto;
                }
                else
                {
                    this.animRepeats++;
                    if (this.animRepeats >= cur_animation.repeatcount)
                    {
                        this.animationFinish(false);
                    }
                    else
                    {
                        this.cur_frame = cur_animation.repeatto;
                    }
                }
            }
            if (this.cur_frame < 0)
            {
                if (cur_animation.pingpong)
                {
                    this.cur_frame = 1;
                    this.animForwards = true;
                    if (!cur_animation.loop)
                    {
                        this.animRepeats++;
                        if (this.animRepeats >= cur_animation.repeatcount)
                        {
                            this.animationFinish(true);
                        }
                    }
                }
                else
                {
                    if (cur_animation.loop)
                    {
                        this.cur_frame = cur_animation.repeatto;
                    }
                    else
                    {
                        this.animRepeats++;
                        if (this.animRepeats >= cur_animation.repeatcount)
                        {
                            this.animationFinish(true);
                        }
                        else
                        {
                            this.cur_frame = cur_animation.repeatto;
                        }
                    }
                }
            }
            if (this.cur_frame < 0)
                this.cur_frame = 0;
            else if (this.cur_frame >= cur_animation.frames.length)
                this.cur_frame = cur_animation.frames.length - 1;
            if (now > this.frameStart + ((cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed) / (cur_timescale === 0 ? 0.000000001 : cur_timescale)))
            {
                this.frameStart = now;
            }
            next_frame = cur_animation.frames[this.cur_frame];
            this.OnFrameChanged(prev_frame, next_frame);
            this.runtime.redraw = true;
        }
    };
    instanceProto.doChangeAnim = function ()
    {
        var prev_frame = this.cur_animation.frames[this.cur_frame];
        var i, len, a, anim = null;
        for (i = 0, len = this.type.animations.length; i < len; i++)
        {
            a = this.type.animations[i];
            if (a.name.toLowerCase() === this.changeAnimName.toLowerCase())
            {
                anim = a;
                break;
            }
        }
        this.changeAnimName = "";
        if (!anim)
            return;
        if (anim.name.toLowerCase() === this.cur_animation.name.toLowerCase() && this.animPlaying)
            return;
        this.cur_animation = anim;
        this.cur_anim_speed = anim.speed;
        if (this.cur_frame < 0)
            this.cur_frame = 0;
        if (this.cur_frame >= this.cur_animation.frames.length)
            this.cur_frame = this.cur_animation.frames.length - 1;
        if (this.changeAnimFrom === 1)
            this.cur_frame = 0;
        this.animPlaying = true;
        this.frameStart = this.getNowTime();
        this.animForwards = true;
        this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
        this.runtime.redraw = true;
    };
    instanceProto.doChangeAnimFrame = function ()
    {
        var prev_frame = this.cur_animation.frames[this.cur_frame];
        var prev_frame_number = this.cur_frame;
        this.cur_frame = cr.floor(this.changeAnimFrame);
        if (this.cur_frame < 0)
            this.cur_frame = 0;
        if (this.cur_frame >= this.cur_animation.frames.length)
            this.cur_frame = this.cur_animation.frames.length - 1;
        if (prev_frame_number !== this.cur_frame)
        {
            this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
            this.frameStart = this.getNowTime();
            this.runtime.redraw = true;
        }
        this.changeAnimFrame = -1;
    };
    instanceProto.OnFrameChanged = function (prev_frame, next_frame)
    {
        var oldw = prev_frame.width;
        var oldh = prev_frame.height;
        var neww = next_frame.width;
        var newh = next_frame.height;
        if (oldw != neww)
            this.width *= (neww / oldw);
        if (oldh != newh)
            this.height *= (newh / oldh);
        this.hotspotX = next_frame.hotspotX;
        this.hotspotY = next_frame.hotspotY;
        this.collision_poly.set_pts(next_frame.poly_pts);
        this.set_bbox_changed();
        this.curFrame = next_frame;
        this.curWebGLTexture = next_frame.webGL_texture;
        var i, len, b;
        for (i = 0, len = this.behavior_insts.length; i < len; i++)
        {
            b = this.behavior_insts[i];
            if (b.onSpriteFrameChanged)
                b.onSpriteFrameChanged(prev_frame, next_frame);
        }
        this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this);
    };
    instanceProto.draw = function(ctx)
    {
        ctx.globalAlpha = this.opacity;
        var cur_frame = this.curFrame;
        var spritesheeted = cur_frame.spritesheeted;
        var cur_image = cur_frame.texture_img;
        var myx = this.x;
        var myy = this.y;
        var w = this.width;
        var h = this.height;
        if (this.angle === 0 && w >= 0 && h >= 0)
        {
            myx -= this.hotspotX * w;
            myy -= this.hotspotY * h;
            if (this.runtime.pixel_rounding)
            {
                myx = (myx + 0.5) | 0;
                myy = (myy + 0.5) | 0;
            }
            if (spritesheeted)
            {
                ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
                                         myx, myy, w, h);
            }
            else
            {
                ctx.drawImage(cur_image, myx, myy, w, h);
            }
        }
        else
        {
            if (this.runtime.pixel_rounding)
            {
                myx = (myx + 0.5) | 0;
                myy = (myy + 0.5) | 0;
            }
            ctx.save();
            var widthfactor = w > 0 ? 1 : -1;
            var heightfactor = h > 0 ? 1 : -1;
            ctx.translate(myx, myy);
            if (widthfactor !== 1 || heightfactor !== 1)
                ctx.scale(widthfactor, heightfactor);
            ctx.rotate(this.angle * widthfactor * heightfactor);
            var drawx = 0 - (this.hotspotX * cr.abs(w))
            var drawy = 0 - (this.hotspotY * cr.abs(h));
            if (spritesheeted)
            {
                ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
                                         drawx, drawy, cr.abs(w), cr.abs(h));
            }
            else
            {
                ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h));
            }
            ctx.restore();
        }
        /*
        ctx.strokeStyle = "#f00";
        ctx.lineWidth = 3;
        ctx.beginPath();
        this.collision_poly.cache_poly(this.width, this.height, this.angle);
        var i, len, ax, ay, bx, by;
        for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
        {
            ax = this.collision_poly.pts_cache[i*2] + this.x;
            ay = this.collision_poly.pts_cache[i*2+1] + this.y;
            bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
            by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
        }
        ctx.stroke();
        ctx.closePath();
        */
        /*
        if (this.behavior_insts.length >= 1 && this.behavior_insts[0].draw)
        {
            this.behavior_insts[0].draw(ctx);
        }
        */
    };
    instanceProto.drawGL = function(glw)
    {
        glw.setTexture(this.curWebGLTexture);
        glw.setOpacity(this.opacity);
        var cur_frame = this.curFrame;
        var q = this.bquad;
        if (this.runtime.pixel_rounding)
        {
            var ox = ((this.x + 0.5) | 0) - this.x;
            var oy = ((this.y + 0.5) | 0) - this.y;
            if (cur_frame.spritesheeted)
                glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
            else
                glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
        }
        else
        {
            if (cur_frame.spritesheeted)
                glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
            else
                glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
        }
    };
    instanceProto.getImagePointIndexByName = function(name_)
    {
        var cur_frame = this.curFrame;
        var i, len;
        for (i = 0, len = cur_frame.image_points.length; i < len; i++)
        {
            if (name_.toLowerCase() === cur_frame.image_points[i][0].toLowerCase())
                return i;
        }
        return -1;
    };
    instanceProto.getImagePoint = function(imgpt, getX)
    {
        var cur_frame = this.curFrame;
        var image_points = cur_frame.image_points;
        var index;
        if (cr.is_string(imgpt))
            index = this.getImagePointIndexByName(imgpt);
        else
            index = imgpt - 1;  // 0 is origin
        index = cr.floor(index);
        if (index < 0 || index >= image_points.length)
            return getX ? this.x : this.y;  // return origin
        var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
        var y = image_points[index][2];
        y = (y - cur_frame.hotspotY) * this.height;
        var cosa = Math.cos(this.angle);
        var sina = Math.sin(this.angle);
        var x_temp = (x * cosa) - (y * sina);
        y = (y * cosa) + (x * sina);
        x = x_temp;
        x += this.x;
        y += this.y;
        return getX ? x : y;
    };
    function Cnds() {};
    function collmemory_add(collmemory, a, b)
    {
        collmemory.push([a, b]);
    };
    function collmemory_remove(collmemory, a, b)
    {
        var i, j = 0, len, entry;
        for (i = 0, len = collmemory.length; i < len; i++)
        {
            entry = collmemory[i];
            if (!((entry[0] === a && entry[1] === b) || (entry[0] === b && entry[1] === a)))
            {
                collmemory[j] = collmemory[i];
                j++;
            }
        }
        collmemory.length = j;
    };
    function collmemory_removeInstance(collmemory, inst)
    {
        var i, j = 0, len, entry;
        for (i = 0, len = collmemory.length; i < len; i++)
        {
            entry = collmemory[i];
            if (entry[0] !== inst && entry[1] !== inst)
            {
                collmemory[j] = collmemory[i];
                j++;
            }
        }
        collmemory.length = j;
    };
    function collmemory_has(collmemory, a, b)
    {
        var i, len, entry;
        for (i = 0, len = collmemory.length; i < len; i++)
        {
            entry = collmemory[i];
            if ((entry[0] === a && entry[1] === b) || (entry[0] === b && entry[1] === a))
                return true;
        }
        return false;
    };
    Cnds.prototype.OnCollision = function (rtype)
    {
        if (!rtype)
            return false;
        var runtime = this.runtime;
        var cnd = runtime.getCurrentCondition();
        var ltype = cnd.type;
        if (!cnd.extra.collmemory)
        {
            cnd.extra.collmemory = [];
            runtime.addDestroyCallback((function (collmemory) {
                return function(inst) {
                    collmemory_removeInstance(collmemory, inst);
                };
            })(cnd.extra.collmemory));
        }
        var lsol = ltype.getCurrentSol();
        var rsol = rtype.getCurrentSol();
        var linstances = lsol.getObjects();
        var rinstances = rsol.getObjects();
        var l, lenl, linst, r, lenr, rinst;
        var curlsol, currsol;
        var current_event = runtime.getCurrentEventStack().current_event;
        var orblock = current_event.orblock;
        for (l = 0, lenl = linstances.length; l < lenl; l++)
        {
            linst = linstances[l];
            for (r = 0, lenr = rinstances.length; r < lenr; r++)
            {
                rinst = rinstances[r];
                if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst))
                {
                    if (!collmemory_has(cnd.extra.collmemory, linst, rinst))
                    {
                        collmemory_add(cnd.extra.collmemory, linst, rinst);
                        runtime.pushCopySol(current_event.solModifiers);
                        curlsol = ltype.getCurrentSol();
                        currsol = rtype.getCurrentSol();
                        curlsol.select_all = false;
                        currsol.select_all = false;
                        if (ltype === rtype)
                        {
                            curlsol.instances.length = 2;   // just use lsol, is same reference as rsol
                            curlsol.instances[0] = linst;
                            curlsol.instances[1] = rinst;
                        }
                        else
                        {
                            curlsol.instances.length = 1;
                            currsol.instances.length = 1;
                            curlsol.instances[0] = linst;
                            currsol.instances[0] = rinst;
                        }
                        current_event.retrigger();
                        runtime.popSol(current_event.solModifiers);
                    }
                }
                else
                {
                    collmemory_remove(cnd.extra.collmemory, linst, rinst);
                }
            }
        }
        return false;
    };
    var rpicktype = null;
    var rtopick = new cr.ObjectSet();
    var needscollisionfinish = false;
    function DoOverlapCondition(rtype, offx, offy)
    {
        if (!rtype)
            return false;
        var do_offset = (offx !== 0 || offy !== 0);
        var oldx, oldy, ret = false, r, lenr, rinst;
        var cnd = this.runtime.getCurrentCondition();
        var ltype = cnd.type;
        var inverted = cnd.inverted;
        var rsol = rtype.getCurrentSol();
        var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
        var rinstances;
        if (rsol.select_all)
            rinstances = rsol.type.instances;
        else if (orblock)
            rinstances = rsol.else_instances;
        else
            rinstances = rsol.instances;
        rpicktype = rtype;
        needscollisionfinish = (ltype !== rtype && !inverted);
        if (do_offset)
        {
            oldx = this.x;
            oldy = this.y;
            this.x += offx;
            this.y += offy;
            this.set_bbox_changed();
        }
        for (r = 0, lenr = rinstances.length; r < lenr; r++)
        {
            rinst = rinstances[r];
            if (this.runtime.testOverlap(this, rinst))
            {
                ret = true;
                if (inverted)
                    break;
                if (ltype !== rtype)
                    rtopick.add(rinst);
            }
        }
        if (do_offset)
        {
            this.x = oldx;
            this.y = oldy;
            this.set_bbox_changed();
        }
        return ret;
    };
    typeProto.finish = function (do_pick)
    {
        if (!needscollisionfinish)
            return;
        if (do_pick)
        {
            var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
            var sol = rpicktype.getCurrentSol();
            var topick = rtopick.valuesRef();
            var i, len, inst;
            if (sol.select_all)
            {
                sol.select_all = false;
                sol.instances.length = topick.length;
                for (i = 0, len = topick.length; i < len; i++)
                {
                    sol.instances[i] = topick[i];
                }
                if (orblock)
                {
                    sol.else_instances.length = 0;
                    for (i = 0, len = rpicktype.instances.length; i < len; i++)
                    {
                        inst = rpicktype.instances[i];
                        if (!rtopick.contains(inst))
                            sol.else_instances.push(inst);
                    }
                }
            }
            else
            {
                var initsize = sol.instances.length;
                sol.instances.length = initsize + topick.length;
                for (i = 0, len = topick.length; i < len; i++)
                {
                    sol.instances[initsize + i] = topick[i];
                    if (orblock)
                        cr.arrayFindRemove(sol.else_instances, topick[i]);
                }
            }
        }
        rtopick.clear();
        needscollisionfinish = false;
    };
    Cnds.prototype.IsOverlapping = function (rtype)
    {
        return DoOverlapCondition.call(this, rtype, 0, 0);
    };
    Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy)
    {
        return DoOverlapCondition.call(this, rtype, offx, offy);
    };
    Cnds.prototype.IsAnimPlaying = function (animname)
    {
        return this.cur_animation.name.toLowerCase() === animname.toLowerCase();
    };
    Cnds.prototype.CompareFrame = function (cmp, framenum)
    {
        return cr.do_cmp(this.cur_frame, cmp, framenum);
    };
    Cnds.prototype.OnAnimFinished = function (animname)
    {
        return this.animTriggerName.toLowerCase() === animname.toLowerCase();
    };
    Cnds.prototype.OnAnyAnimFinished = function ()
    {
        return true;
    };
    Cnds.prototype.OnFrameChanged = function ()
    {
        return true;
    };
    Cnds.prototype.IsMirrored = function ()
    {
        return this.width < 0;
    };
    Cnds.prototype.IsFlipped = function ()
    {
        return this.height < 0;
    };
    Cnds.prototype.OnURLLoaded = function ()
    {
        return true;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.Spawn = function (obj, layer, imgpt)
    {
        if (!obj || !layer)
            return;
        var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
        if (!inst)
            return;
        inst.angle = this.angle;
        inst.set_bbox_changed();
        this.runtime.isInOnDestroy++;
        this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
        this.runtime.isInOnDestroy--;
        var cur_act = this.runtime.getCurrentAction();
        var reset_sol = false;
        if (cr.is_undefined(cur_act.extra.Spawn_LastExec) || cur_act.extra.Spawn_LastExec < this.runtime.execcount)
        {
            reset_sol = true;
            cur_act.extra.Spawn_LastExec = this.runtime.execcount;
        }
        if (obj != this.type)
        {
            var sol = obj.getCurrentSol();
            sol.select_all = false;
            if (reset_sol)
            {
                sol.instances.length = 1;
                sol.instances[0] = inst;
            }
            else
                sol.instances.push(inst);
        }
    };
    Acts.prototype.SetEffect = function (effect)
    {
        this.compositeOp = cr.effectToCompositeOp(effect);
        cr.setGLBlend(this, effect, this.runtime.gl);
        this.runtime.redraw = true;
    };
    Acts.prototype.StopAnim = function ()
    {
        this.animPlaying = false;
    };
    Acts.prototype.StartAnim = function (from)
    {
        this.animPlaying = true;
        this.frameStart = this.getNowTime();
        if (from === 1 && this.cur_frame !== 0)
        {
            var prev_frame = this.cur_animation.frames[this.cur_frame];
            this.cur_frame = 0;
            this.OnFrameChanged(prev_frame, this.cur_animation.frames[0]);
            this.runtime.redraw = true;
        }
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
    };
    Acts.prototype.SetAnim = function (animname, from)
    {
        this.changeAnimName = animname;
        this.changeAnimFrom = from;
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
        if (!this.inAnimTrigger)
            this.doChangeAnim();
    };
    Acts.prototype.SetAnimFrame = function (framenumber)
    {
        this.changeAnimFrame = framenumber;
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
        if (!this.inAnimTrigger)
            this.doChangeAnimFrame();
    };
    Acts.prototype.SetAnimSpeed = function (s)
    {
        this.cur_anim_speed = cr.abs(s);
        this.animForwards = (s >= 0);
        if (!this.isTicking)
        {
            this.runtime.tickMe(this);
            this.isTicking = true;
        }
    };
    Acts.prototype.SetMirrored = function (m)
    {
        var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
        if (this.width === neww)
            return;
        this.width = neww;
        this.set_bbox_changed();
    };
    Acts.prototype.SetFlipped = function (f)
    {
        var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
        if (this.height === newh)
            return;
        this.height = newh;
        this.set_bbox_changed();
    };
    Acts.prototype.SetScale = function (s)
    {
        var cur_frame = this.curFrame;
        var mirror_factor = (this.width < 0 ? -1 : 1);
        var flip_factor = (this.height < 0 ? -1 : 1);
        var new_width = cur_frame.width * s * mirror_factor;
        var new_height = cur_frame.height * s * flip_factor;
        if (this.width !== new_width || this.height !== new_height)
        {
            this.width = new_width;
            this.height = new_height;
            this.set_bbox_changed();
        }
    };
    Acts.prototype.LoadURL = function (url_, resize_)
    {
        var img = new Image();
        var self = this;
        var curFrame_ = this.curFrame;
        img.onload = function ()
        {
            curFrame_.texture_img = img;
            curFrame_.offx = 0;
            curFrame_.offy = 0;
            curFrame_.width = img.width;
            curFrame_.height = img.height;
            curFrame_.spritesheeted = false;
            curFrame_.datauri = "";
            if (self.runtime.glwrap)
            {
                if (curFrame_.webGL_texture)
                    self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
                curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
                if (self.curFrame === curFrame_)
                    self.curWebGLTexture = curFrame_.webGL_texture;
            }
            if (resize_ === 0)      // resize to image size
            {
                self.width = img.width;
                self.height = img.height;
                self.set_bbox_changed();
            }
            self.runtime.redraw = true;
            self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
        };
        if (url_.substr(0, 5) !== "data:")
            img.crossOrigin = 'anonymous';
        img.src = url_;
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.AnimationFrame = function (ret)
    {
        ret.set_int(this.cur_frame);
    };
    Exps.prototype.AnimationFrameCount = function (ret)
    {
        ret.set_int(this.cur_animation.frames.length);
    };
    Exps.prototype.AnimationName = function (ret)
    {
        ret.set_string(this.cur_animation.name);
    };
    Exps.prototype.AnimationSpeed = function (ret)
    {
        ret.set_float(this.cur_anim_speed);
    };
    Exps.prototype.ImagePointX = function (ret, imgpt)
    {
        ret.set_float(this.getImagePoint(imgpt, true));
    };
    Exps.prototype.ImagePointY = function (ret, imgpt)
    {
        ret.set_float(this.getImagePoint(imgpt, false));
    };
    Exps.prototype.ImageWidth = function (ret)
    {
        ret.set_float(this.curFrame.width);
    };
    Exps.prototype.ImageHeight = function (ret)
    {
        ret.set_float(this.curFrame.height);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Text = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Text.prototype;
    pluginProto.onCreate = function ()
    {
        pluginProto.acts.SetWidth = function (w)
        {
            if (this.width !== w)
            {
                this.width = w;
                this.text_changed = true;   // also recalculate text wrapping
                this.set_bbox_changed();
            }
        };
    };
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    typeProto.onLostWebGLContext = function ()
    {
        if (this.is_family)
            return;
        var i, len, inst;
        for (i = 0, len = this.instances.length; i < len; i++)
        {
            inst = this.instances[i];
            inst.mycanvas = null;
            inst.myctx = null;
            inst.mytex = null;
        }
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.lines = [];        // for word wrapping
        this.text_changed = true;
    };
    var instanceProto = pluginProto.Instance.prototype;
    var requestedWebFonts = {};     // already requested web fonts have an entry here
    instanceProto.onCreate = function()
    {
        this.text = this.properties[0];
        this.visible = (this.properties[1] === 0);      // 0=visible, 1=invisible
        this.font = this.properties[2];
        this.color = this.properties[3];
        this.halign = this.properties[4];               // 0=left, 1=center, 2=right
        this.valign = this.properties[5];               // 0=top, 1=center, 2=bottom
        this.wrapbyword = (this.properties[7] === 0);   // 0=word, 1=character
        this.lastwidth = this.width;
        this.lastwrapwidth = this.width;
        this.lastheight = this.height;
        this.line_height_offset = this.properties[8];
        this.facename = "";
        this.fontstyle = "";
        var arr = this.font.split(" ");
        this.ptSize = 0;
        this.textWidth = 0;
        this.textHeight = 0;
        var i;
        for (i = 0; i < arr.length; i++)
        {
            if (arr[i].substr(arr[i].length - 2, 2) === "pt")
            {
                this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
                this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4; // assume 96dpi...
                this.facename = arr[i + 1];
                if (i > 0)
                    this.fontstyle = arr[i - 1];
                break;
            }
        }
        this.mycanvas = null;
        this.myctx = null;
        this.mytex = null;
        this.need_text_redraw = false;
        this.rcTex = new cr.rect(0, 0, 1, 1);
;
    };
    instanceProto.onDestroy = function ()
    {
        this.myctx = null;
        this.mycanvas = null;
        if (this.runtime.glwrap && this.mytex)
            this.runtime.glwrap.deleteTexture(this.mytex);
        this.mytex = null;
    };
    instanceProto.updateFont = function ()
    {
        this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
        this.text_changed = true;
        this.runtime.redraw = true;
    };
    instanceProto.draw = function(ctx, glmode)
    {
        ctx.font = this.font;
        ctx.textBaseline = "top";
        ctx.fillStyle = this.color;
        ctx.globalAlpha = glmode ? 1 : this.opacity;
        var myscale = 1;
        if (glmode)
        {
            myscale = this.layer.getScale();
            ctx.save();
            ctx.scale(myscale, myscale);
        }
        if (this.text_changed || this.width !== this.lastwrapwidth)
        {
            this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
            this.text_changed = false;
            this.lastwrapwidth = this.width;
        }
        this.update_bbox();
        var penX = glmode ? 0 : this.bquad.tlx;
        var penY = glmode ? 0 : this.bquad.tly;
        if (this.runtime.pixel_rounding)
        {
            penX = (penX + 0.5) | 0;
            penY = (penY + 0.5) | 0;
        }
        if (this.angle !== 0 && !glmode)
        {
            ctx.save();
            ctx.translate(penX, penY);
            ctx.rotate(this.angle);
            penX = 0;
            penY = 0;
        }
        var endY = penY + this.height;
        var line_height = this.pxHeight;
        line_height += (this.line_height_offset * this.runtime.devicePixelRatio);
        var drawX;
        var i;
        if (this.valign === 1)      // center
            penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
        else if (this.valign === 2) // bottom
            penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
        for (i = 0; i < this.lines.length; i++)
        {
            drawX = penX;
            if (this.halign === 1)      // center
                drawX = penX + (this.width - this.lines[i].width) / 2;
            else if (this.halign === 2) // right
                drawX = penX + (this.width - this.lines[i].width);
            ctx.fillText(this.lines[i].text, drawX, penY);
            penY += line_height;
            if (penY >= endY - line_height)
                break;
        }
        if (this.angle !== 0 || glmode)
            ctx.restore();
    };
    instanceProto.drawGL = function(glw)
    {
        if (this.width < 1 || this.height < 1)
            return;
        var need_redraw = this.text_changed || this.need_text_redraw;
        this.need_text_redraw = false;
        var layer_scale = this.layer.getScale();
        var layer_angle = this.layer.getAngle();
        var rcTex = this.rcTex;
        var floatscaledwidth = layer_scale * this.width;
        var floatscaledheight = layer_scale * this.height;
        var scaledwidth = Math.ceil(floatscaledwidth);
        var scaledheight = Math.ceil(floatscaledheight);
        var windowWidth = this.runtime.width;
        var windowHeight = this.runtime.height;
        var halfw = windowWidth / 2;
        var halfh = windowHeight / 2;
        if (!this.myctx)
        {
            this.mycanvas = document.createElement("canvas");
            this.mycanvas.width = scaledwidth;
            this.mycanvas.height = scaledheight;
            this.lastwidth = scaledwidth;
            this.lastheight = scaledheight;
            need_redraw = true;
            this.myctx = this.mycanvas.getContext("2d");
        }
        if (scaledwidth !== this.lastwidth || scaledheight !== this.lastheight)
        {
            this.mycanvas.width = scaledwidth;
            this.mycanvas.height = scaledheight;
            if (this.mytex)
            {
                glw.deleteTexture(this.mytex);
                this.mytex = null;
            }
            need_redraw = true;
        }
        if (need_redraw)
        {
            this.myctx.clearRect(0, 0, scaledwidth, scaledheight);
            this.draw(this.myctx, true);
            if (!this.mytex)
                this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling);
            glw.videoToTexture(this.mycanvas, this.mytex);
        }
        this.lastwidth = scaledwidth;
        this.lastheight = scaledheight;
        glw.setTexture(this.mytex);
        glw.setOpacity(this.opacity);
        glw.resetModelView();
        glw.translate(-halfw, -halfh);
        glw.updateModelView();
        var q = this.bquad;
        var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true);
        var tly = this.layer.layerToCanvas(q.tlx, q.tly, false);
        var trx = this.layer.layerToCanvas(q.trx, q.try_, true);
        var try_ = this.layer.layerToCanvas(q.trx, q.try_, false);
        var brx = this.layer.layerToCanvas(q.brx, q.bry, true);
        var bry = this.layer.layerToCanvas(q.brx, q.bry, false);
        var blx = this.layer.layerToCanvas(q.blx, q.bly, true);
        var bly = this.layer.layerToCanvas(q.blx, q.bly, false);
        if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
        {
            var ox = ((tlx + 0.5) | 0) - tlx;
            var oy = ((tly + 0.5) | 0) - tly
            tlx += ox;
            tly += oy;
            trx += ox;
            try_ += oy;
            brx += ox;
            bry += oy;
            blx += ox;
            bly += oy;
        }
        if (this.angle === 0 && layer_angle === 0)
        {
            trx = tlx + scaledwidth;
            try_ = tly;
            brx = trx;
            bry = tly + scaledheight;
            blx = tlx;
            bly = bry;
            rcTex.right = 1;
            rcTex.bottom = 1;
        }
        else
        {
            rcTex.right = floatscaledwidth / scaledwidth;
            rcTex.bottom = floatscaledheight / scaledheight;
        }
        glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
        glw.resetModelView();
        glw.scale(layer_scale, layer_scale);
        glw.rotateZ(-this.layer.getAngle());
        glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
        glw.updateModelView();
    };
    var wordsCache = [];
    pluginProto.TokeniseWords = function (text)
    {
        wordsCache.length = 0;
        var cur_word = "";
        var ch;
        var i = 0;
        while (i < text.length)
        {
            ch = text.charAt(i);
            if (ch === "\n")
            {
                if (cur_word.length)
                {
                    wordsCache.push(cur_word);
                    cur_word = "";
                }
                wordsCache.push("\n");
                ++i;
            }
            else if (ch === " " || ch === "\t" || ch === "-")
            {
                do {
                    cur_word += text.charAt(i);
                    i++;
                }
                while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
                wordsCache.push(cur_word);
                cur_word = "";
            }
            else if (i < text.length)
            {
                cur_word += ch;
                i++;
            }
        }
        if (cur_word.length)
            wordsCache.push(cur_word);
    };
    pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword)
    {
        if (!text || !text.length)
        {
            lines.length = 0;
            return;
        }
        if (width <= 2.0)
        {
            lines.length = 0;
            return;
        }
        if (text.length <= 100 && text.indexOf("\n") === -1)
        {
            var all_width = 0;
            all_width = ctx.measureText(text).width;
            if (all_width <= width)
            {
                if (lines.length)
                    lines.length = 1;
                else
                    lines.push({});
                lines[0].text = text;
                lines[0].width = all_width;
                return;
            }
        }
        this.WrapText(text, lines, ctx, width, wrapbyword);
    };
    pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword)
    {
        var wordArray;
        if (wrapbyword)
        {
            this.TokeniseWords(text);   // writes to wordsCache
            wordArray = wordsCache;
        }
        else
            wordArray = text;
        var cur_line = "";
        var prev_line;
        var line_width;
        var i;
        var lineIndex = 0;
        var line;
        for (i = 0; i < wordArray.length; i++)
        {
            if (wordArray[i] === "\n")
            {
                if (lineIndex >= lines.length)
                    lines.push({});
                line = lines[lineIndex];
                line.text = cur_line;
                line.width = 0;
                line.width = ctx.measureText(cur_line).width;
                lineIndex++;
                cur_line = "";
                continue;
            }
            prev_line = cur_line;
            cur_line += wordArray[i];
            line_width = 0;
            line_width = ctx.measureText(cur_line).width;
            if (line_width >= width)
            {
                if (lineIndex >= lines.length)
                    lines.push({});
                line = lines[lineIndex];
                line.text = prev_line;
                line.width = 0;
                line.width = ctx.measureText(prev_line).width;
                lineIndex++;
                cur_line = wordArray[i];
                if (!wrapbyword && cur_line === " ")
                    cur_line = "";
            }
        }
        if (cur_line.length)
        {
            if (lineIndex >= lines.length)
                lines.push({});
            line = lines[lineIndex];
            line.text = cur_line;
            line.width = 0;
            line.width = ctx.measureText(cur_line).width;
            lineIndex++;
        }
        lines.length = lineIndex;
    };
    function Cnds() {};
    Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
    {
        if (case_sensitive)
            return this.text == text_to_compare;
        else
            return this.text.toLowerCase() == text_to_compare.toLowerCase();
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetText = function(param)
    {
        if (cr.is_number(param) && param < 1e9)
            param = Math.round(param * 1e10) / 1e10;    // round to nearest ten billionth - hides floating point errors
        var text_to_set = param.toString();
        if (this.text !== text_to_set)
        {
            this.text = text_to_set;
            this.text_changed = true;
            this.runtime.redraw = true;
        }
    };
    Acts.prototype.AppendText = function(param)
    {
        if (cr.is_number(param))
            param = Math.round(param * 1e10) / 1e10;    // round to nearest ten billionth - hides floating point errors
        var text_to_append = param.toString();
        if (text_to_append) // not empty
        {
            this.text += text_to_append;
            this.text_changed = true;
            this.runtime.redraw = true;
        }
    };
    Acts.prototype.SetFontFace = function (face_, style_)
    {
        var newstyle = "";
        switch (style_) {
        case 1: newstyle = "bold"; break;
        case 2: newstyle = "italic"; break;
        case 3: newstyle = "bold italic"; break;
        }
        if (face_ === this.facename && newstyle === this.fontstyle)
            return;     // no change
        this.facename = face_;
        this.fontstyle = newstyle;
        this.updateFont();
    };
    Acts.prototype.SetFontSize = function (size_)
    {
        if (this.ptSize === size_)
            return;
        this.ptSize = size_;
        this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4; // assume 96dpi...
        this.updateFont();
    };
    Acts.prototype.SetFontColor = function (rgb)
    {
        var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
        if (newcolor === this.color)
            return;
        this.color = newcolor;
        this.need_text_redraw = true;
        this.runtime.redraw = true;
    };
    Acts.prototype.SetWebFont = function (familyname_, cssurl_)
    {
        if (this.runtime.isDomFree)
        {
            cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
            return;     // DC todo
        }
        var self = this;
        var refreshFunc = (function () {
                            self.runtime.redraw = true;
                            self.text_changed = true;
                        });
        if (requestedWebFonts.hasOwnProperty(cssurl_))
        {
            var newfacename = "'" + familyname_ + "'";
            if (this.facename === newfacename)
                return; // no change
            this.facename = newfacename;
            this.updateFont();
            for (var i = 1; i < 10; i++)
            {
                setTimeout(refreshFunc, i * 100);
                setTimeout(refreshFunc, i * 1000);
            }
            return;
        }
        var wf = document.createElement("link");
        wf.href = cssurl_;
        wf.rel = "stylesheet";
        wf.type = "text/css";
        wf.onload = refreshFunc;
        document.getElementsByTagName('head')[0].appendChild(wf);
        requestedWebFonts[cssurl_] = true;
        this.facename = "'" + familyname_ + "'";
        this.updateFont();
        for (var i = 1; i < 10; i++)
        {
            setTimeout(refreshFunc, i * 100);
            setTimeout(refreshFunc, i * 1000);
        }
;
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.Text = function(ret)
    {
        ret.set_string(this.text);
    };
    Exps.prototype.FaceName = function (ret)
    {
        ret.set_string(this.facename);
    };
    Exps.prototype.FaceSize = function (ret)
    {
        ret.set_int(this.ptSize);
    };
    Exps.prototype.TextWidth = function (ret)
    {
        var w = 0;
        var i, len, x;
        for (i = 0, len = this.lines.length; i < len; i++)
        {
            x = this.lines[i].width;
            if (w < x)
                w = x;
        }
        ret.set_int(w);
    };
    Exps.prototype.TextHeight = function (ret)
    {
        ret.set_int(this.lines.length * this.pxHeight);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.TiledBg = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.TiledBg.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
        if (this.is_family)
            return;
        this.texture_img = new Image();
        this.texture_img.src = this.texture_file;
        this.texture_img.cr_filesize = this.texture_filesize;
        this.runtime.wait_for_textures.push(this.texture_img);
        this.pattern = null;
        this.webGL_texture = null;
    };
    typeProto.onLostWebGLContext = function ()
    {
        if (this.is_family)
            return;
        this.webGL_texture = null;
    };
    typeProto.onRestoreWebGLContext = function ()
    {
        if (this.is_family || !this.instances.length)
            return;
        if (!this.webGL_texture)
            this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling);
        var i, len;
        for (i = 0, len = this.instances.length; i < len; i++)
            this.instances[i].webGL_texture = this.webGL_texture;
    };
    typeProto.unloadTextures = function ()
    {
        if (this.is_family || this.instances.length)
            return;
        if (this.runtime.glwrap)
        {
            if (this.webGL_texture)
            {
                this.runtime.glwrap.deleteTexture(this.webGL_texture);
                this.webGL_texture = null;
            }
        }
        else
        {
            if (this.texture_img["hintUnload"])
                this.texture_img["hintUnload"]();
        }
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };
    var instanceProto = pluginProto.Instance.prototype;
    instanceProto.onCreate = function()
    {
        this.visible = (this.properties[0] === 0);                          // 0=visible, 1=invisible
        this.rcTex = new cr.rect(0, 0, 0, 0);
        this.has_own_texture = false;                                       // true if a texture loaded in from URL
        this.texture_img = this.type.texture_img;
        if (this.runtime.glwrap)
        {
            if (!this.type.webGL_texture)
            {
                this.type.webGL_texture = this.runtime.glwrap.loadTexture(this.type.texture_img, true, this.runtime.linearSampling);
            }
            this.webGL_texture = this.type.webGL_texture;
        }
        else
        {
            if (this.texture_img["hintLoad"])
                this.texture_img["hintLoad"]();
            if (!this.type.pattern)
                this.type.pattern = this.runtime.ctx.createPattern(this.type.texture_img, "repeat");
            this.pattern = this.type.pattern;
        }
    };
    instanceProto.onDestroy = function ()
    {
        if (this.runtime.glwrap && this.has_own_texture && this.webGL_texture)
        {
            this.runtime.glwrap.deleteTexture(this.webGL_texture);
            this.webGL_texture = null;
        }
    };
    instanceProto.draw = function(ctx)
    {
        ctx.globalAlpha = this.opacity;
        ctx.save();
        ctx.fillStyle = this.pattern;
        var myx = this.x;
        var myy = this.y;
        if (this.runtime.pixel_rounding)
        {
            myx = (myx + 0.5) | 0;
            myy = (myy + 0.5) | 0;
        }
        var drawX = -(this.hotspotX * this.width);
        var drawY = -(this.hotspotY * this.height);
        var offX = drawX % this.texture_img.width;
        var offY = drawY % this.texture_img.height;
        if (offX < 0)
            offX += this.texture_img.width;
        if (offY < 0)
            offY += this.texture_img.height;
        ctx.translate(myx, myy);
        ctx.rotate(this.angle);
        ctx.translate(offX, offY);
        ctx.fillRect(drawX - offX,
                     drawY - offY,
                     this.width,
                     this.height);
        ctx.restore();
    };
    instanceProto.drawGL = function(glw)
    {
        glw.setTexture(this.webGL_texture);
        glw.setOpacity(this.opacity);
        var rcTex = this.rcTex;
        rcTex.right = this.width / this.texture_img.width;
        rcTex.bottom = this.height / this.texture_img.height;
        var q = this.bquad;
        if (this.runtime.pixel_rounding)
        {
            var ox = ((this.x + 0.5) | 0) - this.x;
            var oy = ((this.y + 0.5) | 0) - this.y;
            glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, rcTex);
        }
        else
            glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, rcTex);
    };
    function Cnds() {};
    Cnds.prototype.OnURLLoaded = function ()
    {
        return true;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetEffect = function (effect)
    {
        this.compositeOp = cr.effectToCompositeOp(effect);
        cr.setGLBlend(this, effect, this.runtime.gl);
        this.runtime.redraw = true;
    };
    Acts.prototype.LoadURL = function (url_)
    {
        var img = new Image();
        var self = this;
        img.onload = function ()
        {
            self.texture_img = img;
            if (self.runtime.glwrap)
            {
                if (self.has_own_texture && self.webGL_texture)
                    self.runtime.glwrap.deleteTexture(self.webGL_texture);
                self.webGL_texture = self.runtime.glwrap.loadTexture(img, true, self.runtime.linearSampling);
            }
            else
            {
                self.pattern = self.runtime.ctx.createPattern(img, "repeat");
            }
            self.has_own_texture = true;
            self.runtime.redraw = true;
            self.runtime.trigger(cr.plugins_.TiledBg.prototype.cnds.OnURLLoaded, self);
        };
        if (url_.substr(0, 5) !== "data:")
            img.crossOrigin = 'anonymous';
        img.src = url_;
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Touch = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var pluginProto = cr.plugins_.Touch.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
        this.touches = [];
        this.mouseDown = false;
    };
    var instanceProto = pluginProto.Instance.prototype;
    var dummyoffset = {left: 0, top: 0};
    instanceProto.findTouch = function (id)
    {
        var i, len;
        for (i = 0, len = this.touches.length; i < len; i++)
        {
            if (this.touches[i]["id"] === id)
                return i;
        }
        return -1;
    };
    var appmobi_accx = 0;
    var appmobi_accy = 0;
    var appmobi_accz = 0;
    function AppMobiGetAcceleration(evt)
    {
        appmobi_accx = evt.x;
        appmobi_accy = evt.y;
        appmobi_accz = evt.z;
    };
    var pg_accx = 0;
    var pg_accy = 0;
    var pg_accz = 0;
    function PhoneGapGetAcceleration(evt)
    {
        pg_accx = evt.x;
        pg_accy = evt.y;
        pg_accz = evt.z;
    };
    var theInstance = null;
    window["C2_Motion_DCSide"] = function (a, b, g, gx, gy, gz, x, y, z)
    {
        if (!theInstance)
            return;
        theInstance.orient_alpha = a;
        theInstance.orient_beta = b;
        theInstance.orient_gamma = g;
        theInstance.acc_g_x = gx;
        theInstance.acc_g_y = gy;
        theInstance.acc_g_z = gz;
        theInstance.acc_x = x;
        theInstance.acc_y = y;
        theInstance.acc_z = z;
    };
    instanceProto.onCreate = function()
    {
        theInstance = this;
        this.isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
        this.orient_alpha = 0;
        this.orient_beta = 0;
        this.orient_gamma = 0;
        this.acc_g_x = 0;
        this.acc_g_y = 0;
        this.acc_g_z = 0;
        this.acc_x = 0;
        this.acc_y = 0;
        this.acc_z = 0;
        this.curTouchX = 0;
        this.curTouchY = 0;
        this.trigger_index = 0;
        this.useMouseInput = (this.properties[0] !== 0);
        var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
        if (this.runtime.isDirectCanvas)
            elem = window["Canvas"];
        else if (this.runtime.isCocoonJs)
            elem = window;
        var self = this;
        if (window.navigator["msPointerEnabled"])
        {
            elem.addEventListener("MSPointerDown",
                function(info) {
                    self.onPointerStart(info);
                },
                false
            );
            elem.addEventListener("MSPointerMove",
                function(info) {
                    self.onPointerMove(info);
                },
                false
            );
            elem.addEventListener("MSPointerUp",
                function(info) {
                    self.onPointerEnd(info);
                },
                false
            );
            elem.addEventListener("MSPointerCancel",
                function(info) {
                    self.onPointerEnd(info);
                },
                false
            );
            if (this.runtime.canvas)
            {
                this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
                    e.preventDefault();
                }, false);
                document.addEventListener("MSGestureHold", function(e) {
                    e.preventDefault();
                }, false);
            }
        }
        else
        {
            elem.addEventListener("touchstart",
                function(info) {
                    self.onTouchStart(info);
                },
                false
            );
            elem.addEventListener("touchmove",
                function(info) {
                    self.onTouchMove(info);
                },
                false
            );
            elem.addEventListener("touchend",
                function(info) {
                    self.onTouchEnd(info);
                },
                false
            );
            elem.addEventListener("touchcancel",
                function(info) {
                    self.onTouchEnd(info);
                },
                false
            );
        }
        if (this.isWindows8)
        {
            var win8accelerometerFn = function(e) {
                    var reading = e["reading"];
                    self.acc_x = reading["accelerationX"];
                    self.acc_y = reading["accelerationY"];
                    self.acc_z = reading["accelerationZ"];
                };
            var win8inclinometerFn = function(e) {
                    var reading = e["reading"];
                    self.orient_alpha = reading["yawDegrees"];
                    self.orient_beta = reading["pitchDegrees"];
                    self.orient_gamma = reading["rollDegrees"];
                };
            var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
            if (accelerometer)
            {
                accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
                accelerometer.addEventListener("readingchanged", win8accelerometerFn);
            }
            var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
            if (inclinometer)
            {
                inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
                inclinometer.addEventListener("readingchanged", win8inclinometerFn);
            }
            document.addEventListener("visibilitychange", function(e) {
                if (document["hidden"] || document["msHidden"])
                {
                    if (accelerometer)
                        accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
                    if (inclinometer)
                        inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
                }
                else
                {
                    if (accelerometer)
                        accelerometer.addEventListener("readingchanged", win8accelerometerFn);
                    if (inclinometer)
                        inclinometer.addEventListener("readingchanged", win8inclinometerFn);
                }
            }, false);
        }
        else
        {
            window.addEventListener("deviceorientation", function (eventData) {
                self.orient_alpha = eventData["alpha"] || 0;
                self.orient_beta = eventData["beta"] || 0;
                self.orient_gamma = eventData["gamma"] || 0;
            }, false);
            window.addEventListener("devicemotion", function (eventData) {
                if (eventData["accelerationIncludingGravity"])
                {
                    self.acc_g_x = eventData["accelerationIncludingGravity"]["x"];
                    self.acc_g_y = eventData["accelerationIncludingGravity"]["y"];
                    self.acc_g_z = eventData["accelerationIncludingGravity"]["z"];
                }
                if (eventData["acceleration"])
                {
                    self.acc_x = eventData["acceleration"]["x"];
                    self.acc_y = eventData["acceleration"]["y"];
                    self.acc_z = eventData["acceleration"]["z"];
                }
            }, false);
        }
        if (this.useMouseInput && !this.runtime.isDomFree)
        {
            jQuery(document).mousemove(
                function(info) {
                    self.onMouseMove(info);
                }
            );
            jQuery(document).mousedown(
                function(info) {
                    self.onMouseDown(info);
                }
            );
            jQuery(document).mouseup(
                function(info) {
                    self.onMouseUp(info);
                }
            );
        }
        if (this.runtime.isAppMobi && !this.runtime.isDirectCanvas)
        {
            AppMobi["accelerometer"]["watchAcceleration"](AppMobiGetAcceleration, { "frequency": 40, "adjustForRotation": true });
        }
        if (this.runtime.isPhoneGap)
        {
            navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
        }
        this.runtime.tick2Me(this);
    };
    instanceProto.onPointerMove = function (info)
    {
        if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
            return;
        if (info.preventDefault)
            info.preventDefault();
        var i = this.findTouch(info["pointerId"]);
        var nowtime = cr.performance_now();
        if (i >= 0)
        {
            var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
            var t = this.touches[i];
            if (nowtime - t.time < 2)
                return;
            t.lasttime = t.time;
            t.lastx = t.x;
            t.lasty = t.y;
            t.time = nowtime;
            t.x = info.pageX - offset.left;
            t.y = info.pageY - offset.top;
        }
    };
    instanceProto.onPointerStart = function (info)
    {
        if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
            return;
        if (info.preventDefault)
            info.preventDefault();
        var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
        var touchx = info.pageX - offset.left;
        var touchy = info.pageY - offset.top;
        var nowtime = cr.performance_now();
        this.trigger_index = this.touches.length;
        this.touches.push({ time: nowtime,
                            x: touchx,
                            y: touchy,
                            lasttime: nowtime,
                            lastx: touchx,
                            lasty: touchy,
                            "id": info["pointerId"],
                            startindex: this.trigger_index
                        });
        this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
        this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
        this.curTouchX = touchx;
        this.curTouchY = touchy;
        this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
    };
    instanceProto.onPointerEnd = function (info)
    {
        if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
            return;
        if (info.preventDefault)
            info.preventDefault();
        var i = this.findTouch(info["pointerId"]);
        this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
        this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
        this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
        if (i >= 0)
        {
            this.touches.splice(i, 1);
        }
    };
    instanceProto.onTouchMove = function (info)
    {
        if (info.preventDefault)
            info.preventDefault();
        var nowtime = cr.performance_now();
        var i, len, t, u;
        for (i = 0, len = info.changedTouches.length; i < len; i++)
        {
            t = info.changedTouches[i];
            var j = this.findTouch(t["identifier"]);
            if (j >= 0)
            {
                var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
                u = this.touches[j];
                if (nowtime - u.time < 2)
                    continue;
                u.lasttime = u.time;
                u.lastx = u.x;
                u.lasty = u.y;
                u.time = nowtime;
                u.x = t.pageX - offset.left;
                u.y = t.pageY - offset.top;
            }
        }
    };
    instanceProto.onTouchStart = function (info)
    {
        if (info.preventDefault)
            info.preventDefault();
        var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
        var nowtime = cr.performance_now();
        var i, len, t;
        for (i = 0, len = info.changedTouches.length; i < len; i++)
        {
            t = info.changedTouches[i];
            var touchx = t.pageX - offset.left;
            var touchy = t.pageY - offset.top;
            this.trigger_index = this.touches.length;
            this.touches.push({ time: nowtime,
                                x: touchx,
                                y: touchy,
                                lasttime: nowtime,
                                lastx: touchx,
                                lasty: touchy,
                                "id": t["identifier"],
                                startindex: this.trigger_index
                            });
            this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
            this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
            this.curTouchX = touchx;
            this.curTouchY = touchy;
            this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
        }
    };
    instanceProto.onTouchEnd = function (info)
    {
        if (info.preventDefault)
            info.preventDefault();
        var i, len, t;
        for (i = 0, len = info.changedTouches.length; i < len; i++)
        {
            t = info.changedTouches[i];
            var j = this.findTouch(t["identifier"]);
            this.trigger_index = (j >= 0 ? this.touches[j].startindex : -1);
            this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
            this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
            if (j >= 0)
            {
                this.touches.splice(j, 1);
            }
        }
    };
    instanceProto.getAlpha = function ()
    {
        if (this.runtime.isAppMobi && this.orient_alpha === 0 && appmobi_accz !== 0)
            return appmobi_accz * 90;
        else if (this.runtime.isPhoneGap  && this.orient_alpha === 0 && pg_accz !== 0)
            return pg_accz * 90;
        else
            return this.orient_alpha;
    };
    instanceProto.getBeta = function ()
    {
        if (this.runtime.isAppMobi && this.orient_beta === 0 && appmobi_accy !== 0)
            return appmobi_accy * -90;
        else if (this.runtime.isPhoneGap  && this.orient_beta === 0 && pg_accy !== 0)
            return pg_accy * -90;
        else
            return this.orient_beta;
    };
    instanceProto.getGamma = function ()
    {
        if (this.runtime.isAppMobi && this.orient_gamma === 0 && appmobi_accx !== 0)
            return appmobi_accx * 90;
        else if (this.runtime.isPhoneGap  && this.orient_gamma === 0 && pg_accx !== 0)
            return pg_accx * 90;
        else
            return this.orient_gamma;
    };
    var noop_func = function(){};
    instanceProto.onMouseDown = function(info)
    {
        if (info.preventDefault)
            info.preventDefault();
        var t = { pageX: info.pageX, pageY: info.pageY, "identifier": -1 };
        var fakeinfo = { changedTouches: [t] };
        this.onTouchStart(fakeinfo);
        this.mouseDown = true;
    };
    instanceProto.onMouseMove = function(info)
    {
        if (info.preventDefault)
            info.preventDefault();
        if (!this.mouseDown)
            return;
        var t = { pageX: info.pageX, pageY: info.pageY, "identifier": -1 };
        var fakeinfo = { changedTouches: [t] };
        this.onTouchMove(fakeinfo);
    };
    instanceProto.onMouseUp = function(info)
    {
        if (info.preventDefault)
            info.preventDefault();
        var t = { pageX: info.pageX, pageY: info.pageY, "identifier": -1 };
        var fakeinfo = { changedTouches: [t] };
        this.onTouchEnd(fakeinfo);
        this.mouseDown = false;
    };
    instanceProto.tick2 = function()
    {
        var i, len, t;
        var nowtime = cr.performance_now();
        for (i = 0, len = this.touches.length; i < len; i++)
        {
            t = this.touches[i];
            if (t.time <= nowtime - 50)
                t.lasttime = nowtime;
        }
    };
    function Cnds() {};
    Cnds.prototype.OnTouchStart = function ()
    {
        return true;
    };
    Cnds.prototype.OnTouchEnd = function ()
    {
        return true;
    };
    Cnds.prototype.IsInTouch = function ()
    {
        return this.touches.length;
    };
    Cnds.prototype.OnTouchObject = function (type)
    {
        if (!type)
            return false;
        return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
    };
    Cnds.prototype.IsTouchingObject = function (type)
    {
        if (!type)
            return false;
        var sol = type.getCurrentSol();
        var instances = sol.getObjects();
        var px, py;
        var touching = [];
        var i, leni, j, lenj;
        for (i = 0, leni = instances.length; i < leni; i++)
        {
            var inst = instances[i];
            inst.update_bbox();
            for (j = 0, lenj = this.touches.length; j < lenj; j++)
            {
                var touch = this.touches[j];
                px = inst.layer.canvasToLayer(touch.x, touch.y, true);
                py = inst.layer.canvasToLayer(touch.x, touch.y, false);
                if (inst.contains_pt(px, py))
                {
                    touching.push(inst);
                    break;
                }
            }
        }
        if (touching.length)
        {
            sol.select_all = false;
            sol.instances = touching;
            return true;
        }
        else
            return false;
    };
    Cnds.prototype.CompareTouchSpeed = function (index, cmp, s)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
            return false;
        var t = this.touches[index];
        var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
        var timediff = (t.time - t.lasttime) / 1000;
        var speed = 0;
        if (timediff > 0)
            speed = dist / timediff;
        return cr.do_cmp(speed, cmp, s);
    };
    Cnds.prototype.OrientationSupported = function ()
    {
        return typeof window["DeviceOrientationEvent"] !== "undefined";
    };
    Cnds.prototype.MotionSupported = function ()
    {
        return typeof window["DeviceMotionEvent"] !== "undefined";
    };
    Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_)
    {
        var v = 0;
        if (orientation_ === 0)
            v = this.getAlpha();
        else if (orientation_ === 1)
            v = this.getBeta();
        else
            v = this.getGamma();
        return cr.do_cmp(v, cmp_, angle_);
    };
    Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_)
    {
        var v = 0;
        if (acceleration_ === 0)
            v = this.acc_g_x;
        else if (acceleration_ === 1)
            v = this.acc_g_y;
        else if (acceleration_ === 2)
            v = this.acc_g_z;
        else if (acceleration_ === 3)
            v = this.acc_x;
        else if (acceleration_ === 4)
            v = this.acc_y;
        else if (acceleration_ === 5)
            v = this.acc_z;
        return cr.do_cmp(v, cmp_, angle_);
    };
    Cnds.prototype.OnNthTouchStart = function (touch_)
    {
        touch_ = Math.floor(touch_);
        return touch_ === this.trigger_index;
    };
    Cnds.prototype.OnNthTouchEnd = function (touch_)
    {
        touch_ = Math.floor(touch_);
        return touch_ === this.trigger_index;
    };
    Cnds.prototype.HasNthTouch = function (touch_)
    {
        touch_ = Math.floor(touch_);
        return this.touches.length >= touch_ + 1;
    };
    pluginProto.cnds = new Cnds();
    function Exps() {};
    Exps.prototype.TouchCount = function (ret)
    {
        ret.set_int(this.touches.length);
    };
    Exps.prototype.X = function (ret, layerparam)
    {
        if (this.touches.length)
        {
            var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
            if (cr.is_undefined(layerparam))
            {
                layer = this.runtime.getLayerByNumber(0);
                oldScale = layer.scale;
                oldZoomRate = layer.zoomRate;
                oldParallaxX = layer.parallaxX;
                oldAngle = layer.angle;
                layer.scale = this.runtime.running_layout.scale;
                layer.zoomRate = 1.0;
                layer.parallaxX = 1.0;
                layer.angle = this.runtime.running_layout.angle;
                ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
                layer.scale = oldScale;
                layer.zoomRate = oldZoomRate;
                layer.parallaxX = oldParallaxX;
                layer.angle = oldAngle;
            }
            else
            {
                if (cr.is_number(layerparam))
                    layer = this.runtime.getLayerByNumber(layerparam);
                else
                    layer = this.runtime.getLayerByName(layerparam);
                if (layer)
                    ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
                else
                    ret.set_float(0);
            }
        }
        else
            ret.set_float(0);
    };
    Exps.prototype.XAt = function (ret, index, layerparam)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
        {
            ret.set_float(0);
            return;
        }
        var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
        if (cr.is_undefined(layerparam))
        {
            layer = this.runtime.getLayerByNumber(0);
            oldScale = layer.scale;
            oldZoomRate = layer.zoomRate;
            oldParallaxX = layer.parallaxX;
            oldAngle = layer.angle;
            layer.scale = this.runtime.running_layout.scale;
            layer.zoomRate = 1.0;
            layer.parallaxX = 1.0;
            layer.angle = this.runtime.running_layout.angle;
            ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
            layer.scale = oldScale;
            layer.zoomRate = oldZoomRate;
            layer.parallaxX = oldParallaxX;
            layer.angle = oldAngle;
        }
        else
        {
            if (cr.is_number(layerparam))
                layer = this.runtime.getLayerByNumber(layerparam);
            else
                layer = this.runtime.getLayerByName(layerparam);
            if (layer)
                ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
            else
                ret.set_float(0);
        }
    };
    Exps.prototype.Y = function (ret, layerparam)
    {
        if (this.touches.length)
        {
            var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
            if (cr.is_undefined(layerparam))
            {
                layer = this.runtime.getLayerByNumber(0);
                oldScale = layer.scale;
                oldZoomRate = layer.zoomRate;
                oldParallaxY = layer.parallaxY;
                oldAngle = layer.angle;
                layer.scale = this.runtime.running_layout.scale;
                layer.zoomRate = 1.0;
                layer.parallaxY = 1.0;
                layer.angle = this.runtime.running_layout.angle;
                ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
                layer.scale = oldScale;
                layer.zoomRate = oldZoomRate;
                layer.parallaxY = oldParallaxY;
                layer.angle = oldAngle;
            }
            else
            {
                if (cr.is_number(layerparam))
                    layer = this.runtime.getLayerByNumber(layerparam);
                else
                    layer = this.runtime.getLayerByName(layerparam);
                if (layer)
                    ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
                else
                    ret.set_float(0);
            }
        }
        else
            ret.set_float(0);
    };
    Exps.prototype.YAt = function (ret, index, layerparam)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
        {
            ret.set_float(0);
            return;
        }
        var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
        if (cr.is_undefined(layerparam))
        {
            layer = this.runtime.getLayerByNumber(0);
            oldScale = layer.scale;
            oldZoomRate = layer.zoomRate;
            oldParallaxY = layer.parallaxY;
            oldAngle = layer.angle;
            layer.scale = this.runtime.running_layout.scale;
            layer.zoomRate = 1.0;
            layer.parallaxY = 1.0;
            layer.angle = this.runtime.running_layout.angle;
            ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
            layer.scale = oldScale;
            layer.zoomRate = oldZoomRate;
            layer.parallaxY = oldParallaxY;
            layer.angle = oldAngle;
        }
        else
        {
            if (cr.is_number(layerparam))
                layer = this.runtime.getLayerByNumber(layerparam);
            else
                layer = this.runtime.getLayerByName(layerparam);
            if (layer)
                ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
            else
                ret.set_float(0);
        }
    };
    Exps.prototype.AbsoluteX = function (ret)
    {
        if (this.touches.length)
            ret.set_float(this.touches[0].x);
        else
            ret.set_float(0);
    };
    Exps.prototype.AbsoluteXAt = function (ret, index)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
        {
            ret.set_float(0);
            return;
        }
        ret.set_float(this.touches[index].x);
    };
    Exps.prototype.AbsoluteY = function (ret)
    {
        if (this.touches.length)
            ret.set_float(this.touches[0].y);
        else
            ret.set_float(0);
    };
    Exps.prototype.AbsoluteYAt = function (ret, index)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
        {
            ret.set_float(0);
            return;
        }
        ret.set_float(this.touches[index].y);
    };
    Exps.prototype.SpeedAt = function (ret, index)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
        {
            ret.set_float(0);
            return;
        }
        var t = this.touches[index];
        var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
        var timediff = (t.time - t.lasttime) / 1000;
        if (timediff === 0)
            ret.set_float(0);
        else
            ret.set_float(dist / timediff);
    };
    Exps.prototype.AngleAt = function (ret, index)
    {
        index = Math.floor(index);
        if (index < 0 || index >= this.touches.length)
        {
            ret.set_float(0);
            return;
        }
        var t = this.touches[index];
        ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
    };
    Exps.prototype.Alpha = function (ret)
    {
        ret.set_float(this.getAlpha());
    };
    Exps.prototype.Beta = function (ret)
    {
        ret.set_float(this.getBeta());
    };
    Exps.prototype.Gamma = function (ret)
    {
        ret.set_float(this.getGamma());
    };
    Exps.prototype.AccelerationXWithG = function (ret)
    {
        ret.set_float(this.acc_g_x);
    };
    Exps.prototype.AccelerationYWithG = function (ret)
    {
        ret.set_float(this.acc_g_y);
    };
    Exps.prototype.AccelerationZWithG = function (ret)
    {
        ret.set_float(this.acc_g_z);
    };
    Exps.prototype.AccelerationX = function (ret)
    {
        ret.set_float(this.acc_x);
    };
    Exps.prototype.AccelerationY = function (ret)
    {
        ret.set_float(this.acc_y);
    };
    Exps.prototype.AccelerationZ = function (ret)
    {
        ret.set_float(this.acc_z);
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.WebStorage = function(runtime)
{
    this.runtime = runtime;
};
(function()
{
    var pluginProto = cr.plugins_.WebStorage.prototype;
    pluginProto.Type = function(plugin)
    {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };
    var typeProto = pluginProto.Type.prototype;
    typeProto.onCreate = function()
    {
    };
    pluginProto.Instance = function(type)
    {
        this.type = type;
        this.runtime = type.runtime;
    };
    var instanceProto = pluginProto.Instance.prototype;
    var prefix = "";
    var is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
    if (is_arcade)
        prefix = "arcade" + window["scirra_arcade_id"];
    var logged_sessionnotsupported = false;
    function LogSessionNotSupported()
    {
        if (logged_sessionnotsupported)
            return;
        cr.logexport("[Construct 2] Webstorage plugin: session storage is not supported on this platform. Try using local storage or global variables instead.");
        logged_sessionnotsupported = true;
    };
    instanceProto.onCreate = function()
    {
    };
    function Cnds() {};
    Cnds.prototype.LocalStorageEnabled = function()
    {
        return true;
    };
    Cnds.prototype.SessionStorageEnabled = function()
    {
        return true;
    };
    Cnds.prototype.LocalStorageExists = function(key)
    {
        return localStorage.getItem(prefix + key) != null;
    };
    Cnds.prototype.SessionStorageExists = function(key)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            return false;
        }
        return sessionStorage.getItem(prefix + key) != null;
    };
    Cnds.prototype.OnQuotaExceeded = function ()
    {
        return true;
    };
    pluginProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.StoreLocal = function(key, data)
    {
        try {
            localStorage.setItem(prefix + key, data);
        }
        catch (e)
        {
            this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
        }
    };
    Acts.prototype.StoreSession = function(key,data)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            return;
        }
        try {
            sessionStorage.setItem(prefix + key, data);
        }
        catch (e)
        {
            this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
        }
    };
    Acts.prototype.RemoveLocal = function(key)
    {
        localStorage.removeItem(prefix + key);
    };
    Acts.prototype.RemoveSession = function(key)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            return;
        }
        sessionStorage.removeItem(prefix + key);
    };
    Acts.prototype.ClearLocal = function()
    {
        if (!is_arcade)
            localStorage.clear();
    };
    Acts.prototype.ClearSession = function()
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            return;
        }
        if (!is_arcade)
            sessionStorage.clear();
    };
    Acts.prototype.JSONLoad = function (json_, mode_)
    {
        var d;
        try {
            d = JSON.parse(json_);
        }
        catch(e) { return; }
        if (!d["c2dictionary"])         // presumably not a c2dictionary object
            return;
        var o = d["data"];
        if (mode_ === 0 && !is_arcade)  // 'set' mode: must clear webstorage first
            localStorage.clear();
        var p;
        for (p in o)
        {
            if (o.hasOwnProperty(p))
            {
                try {
                    localStorage.setItem(prefix + p, o[p]);
                }
                catch (e)
                {
                    this.runtime.trigger(cr.plugins_.WebStorage.prototype.cnds.OnQuotaExceeded, this);
                    return;
                }
            }
        }
    };
    pluginProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.LocalValue = function(ret,key)
    {
        ret.set_string(localStorage.getItem(prefix + key) || "");
    };
    Exps.prototype.SessionValue = function(ret,key)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            ret.set_string("");
            return;
        }
        ret.set_string(sessionStorage.getItem(prefix + key) || "");
    };
    Exps.prototype.LocalCount = function(ret)
    {
        ret.set_int(is_arcade ? 0 : localStorage.length);
    };
    Exps.prototype.SessionCount = function(ret)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            ret.set_int(0);
            return;
        }
        ret.set_int(is_arcade ? 0 : sessionStorage.length);
    };
    Exps.prototype.LocalAt = function(ret,n)
    {
        if (is_arcade)
            ret.set_string("");
        else
            ret.set_string(localStorage.getItem(localStorage.key(n)) || "");
    };
    Exps.prototype.SessionAt = function(ret,n)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            ret.set_string("");
            return;
        }
        if (is_arcade)
            ret.set_string("");
        else
            ret.set_string(sessionStorage.getItem(sessionStorage.key(n)) || "");
    };
    Exps.prototype.LocalKeyAt = function(ret,n)
    {
        if (is_arcade)
            ret.set_string("");
        else
            ret.set_string(localStorage.key(n));
    };
    Exps.prototype.SessionKeyAt = function(ret,n)
    {
        if (this.runtime.isCocoonJs || !sessionStorage)
        {
            LogSessionNotSupported();
            ret.set_string("");
            return;
        }
        if (is_arcade)
            ret.set_string("");
        else
            ret.set_string(sessionStorage.key(n));
    };
    Exps.prototype.AsJSON = function (ret)
    {
        var o = {}, i, len, k;
        for (i = 0, len = localStorage.length; i < len; i++)
        {
            k = localStorage.key(i);
            if (is_arcade)
            {
                if (k.substr(0, prefix.length) === prefix)
                {
                    o[k.substr(prefix.length)] = localStorage.getItem(k);
                }
            }
            else
                o[k] = localStorage.getItem(k);
        }
        ret.set_string(JSON.stringify({
            "c2dictionary": true,
            "data": o
        }));
    };
    pluginProto.exps = new Exps();
}());
;
;
cr.behaviors.Bullet = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.Bullet.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
        var speed = this.properties[0];
        this.acc = this.properties[1];
        this.g = this.properties[2];
        this.bounceOffSolid = (this.properties[3] !== 0);
        this.setAngle = (this.properties[4] !== 0);
        this.dx = Math.cos(this.inst.angle) * speed;
        this.dy = Math.sin(this.inst.angle) * speed;
        this.lastx = this.inst.x;
        this.lasty = this.inst.y;
        this.lastKnownAngle = this.inst.angle;
        this.travelled = 0;
        this.enabled = true;
    };
    behinstProto.tick = function ()
    {
        if (!this.enabled)
            return;
        var dt = this.runtime.getDt(this.inst);
        var s, a;
        var bounceSolid, bounceAngle;
        if (this.inst.angle !== this.lastKnownAngle)
        {
            if (this.setAngle)
            {
                s = cr.distanceTo(0, 0, this.dx, this.dy);
                this.dx = Math.cos(this.inst.angle) * s;
                this.dy = Math.sin(this.inst.angle) * s;
            }
            this.lastKnownAngle = this.inst.angle;
        }
        if (this.acc !== 0)
        {
            s = cr.distanceTo(0, 0, this.dx, this.dy);
            if (this.dx === 0 && this.dy === 0)
                a = this.inst.angle;
            else
                a = cr.angleTo(0, 0, this.dx, this.dy);
            s += this.acc * dt;
            if (s < 0)
                s = 0;
            this.dx = Math.cos(a) * s;
            this.dy = Math.sin(a) * s;
        }
        if (this.g !== 0)
            this.dy += this.g * dt;
        this.lastx = this.inst.x;
        this.lasty = this.inst.y;
        if (this.dx !== 0 || this.dy !== 0)
        {
            this.inst.x += this.dx * dt;
            this.inst.y += this.dy * dt;
            this.travelled += cr.distanceTo(0, 0, this.dx * dt, this.dy * dt)
            if (this.setAngle)
            {
                this.inst.angle = cr.angleTo(0, 0, this.dx, this.dy);
                this.inst.set_bbox_changed();
                this.lastKnownAngle = this.inst.angle;
            }
            this.inst.set_bbox_changed();
            if (this.bounceOffSolid)
            {
                bounceSolid = this.runtime.testOverlapSolid(this.inst);
                if (bounceSolid)
                {
                    this.runtime.registerCollision(this.inst, bounceSolid);
                    s = cr.distanceTo(0, 0, this.dx, this.dy);
                    bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty);
                    this.dx = Math.cos(bounceAngle) * s;
                    this.dy = Math.sin(bounceAngle) * s;
                    this.inst.x += this.dx * dt;            // move out for one tick since the object can't have spent a tick in the solid
                    this.inst.y += this.dy * dt;
                    this.inst.set_bbox_changed();
                    if (this.setAngle)
                    {
                        this.inst.angle = bounceAngle;
                        this.lastKnownAngle = bounceAngle;
                        this.inst.set_bbox_changed();
                    }
                    if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
                        this.runtime.pushOutSolidNearest(this.inst, 100);
                }
            }
        }
    };
    function Cnds() {};
    Cnds.prototype.CompareSpeed = function (cmp, s)
    {
        return cr.do_cmp(cr.distanceTo(0, 0, this.dx, this.dy), cmp, s);
    };
    Cnds.prototype.CompareTravelled = function (cmp, d)
    {
        return cr.do_cmp(this.travelled, cmp, d);
    };
    behaviorProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetSpeed = function (s)
    {
        var a = cr.angleTo(0, 0, this.dx, this.dy);
        this.dx = Math.cos(a) * s;
        this.dy = Math.sin(a) * s;
    };
    Acts.prototype.SetAcceleration = function (a)
    {
        this.acc = a;
    };
    Acts.prototype.SetGravity = function (g)
    {
        this.g = g;
    };
    Acts.prototype.SetAngleOfMotion = function (a)
    {
        a = cr.to_radians(a);
        var s = cr.distanceTo(0, 0, this.dx, this.dy)
        this.dx = Math.cos(a) * s;
        this.dy = Math.sin(a) * s;
    };
    Acts.prototype.Bounce = function (objtype)
    {
        if (!objtype)
            return;
        var otherinst = objtype.getFirstPicked();
        if (!otherinst)
            return;
        var dt = this.runtime.getDt(this.inst);
        var s = cr.distanceTo(0, 0, this.dx, this.dy);
        var bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty, otherinst);
        this.dx = Math.cos(bounceAngle) * s;
        this.dy = Math.sin(bounceAngle) * s;
        this.inst.x += this.dx * dt;            // move out for one tick since the object can't have spent a tick in the solid
        this.inst.y += this.dy * dt;
        this.inst.set_bbox_changed();
        if (this.setAngle)
        {
            this.inst.angle = bounceAngle;
            this.lastKnownAngle = bounceAngle;
            this.inst.set_bbox_changed();
        }
        if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
            this.runtime.pushOutSolidNearest(this.inst, 100);
    };
    Acts.prototype.SetEnabled = function (en)
    {
        this.enabled = (en === 1);
    };
    behaviorProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.Speed = function (ret)
    {
        var s = cr.distanceTo(0, 0, this.dx, this.dy);
        s = cr.round6dp(s);
        ret.set_float(s);
    };
    Exps.prototype.Acceleration = function (ret)
    {
        ret.set_float(this.acc);
    };
    Exps.prototype.AngleOfMotion = function (ret)
    {
        ret.set_float(cr.to_degrees(cr.angleTo(0, 0, this.dx, this.dy)));
    };
    Exps.prototype.DistanceTravelled = function (ret)
    {
        ret.set_float(this.travelled);
    };
    behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Fade = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.Fade.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
        var active_at_start = this.properties[0] === 1;
        this.fadeInTime = this.properties[1];
        this.waitTime = this.properties[2];
        this.fadeOutTime = this.properties[3];
        this.destroy = this.properties[4];          // 0 = no, 1 = after fade out
        this.stage = active_at_start ? 0 : 3;       // 0 = fade in, 1 = wait, 2 = fade out, 3 = done
        this.stageTime = new cr.KahanAdder();
        this.maxOpacity = (this.inst.opacity ? this.inst.opacity : 1.0);
        if (active_at_start)
        {
            if (this.fadeInTime === 0)
            {
                this.stage = 1;
                if (this.waitTime === 0)
                    this.stage = 2;
            }
            else
            {
                this.inst.opacity = 0;
                this.runtime.redraw = true;
            }
        }
    };
    behinstProto.tick = function ()
    {
        this.stageTime.add(this.runtime.getDt(this.inst));
        if (this.stage === 0)
        {
            this.inst.opacity = (this.stageTime.sum / this.fadeInTime) * this.maxOpacity;
            this.runtime.redraw = true;
            if (this.inst.opacity >= this.maxOpacity)
            {
                this.inst.opacity = this.maxOpacity;
                this.stage = 1; // wait stage
                this.stageTime.reset();
            }
        }
        if (this.stage === 1)
        {
            if (this.stageTime.sum >= this.waitTime)
            {
                this.stage = 2; // fade out stage
                this.stageTime.reset();
            }
        }
        if (this.stage === 2)
        {
            if (this.fadeOutTime !== 0)
            {
                this.inst.opacity = this.maxOpacity - ((this.stageTime.sum / this.fadeOutTime) * this.maxOpacity);
                this.runtime.redraw = true;
                if (this.inst.opacity < 0)
                {
                    this.inst.opacity = 0;
                    this.stage = 3; // done
                    this.stageTime.reset();
                    this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeOutEnd, this.inst);
                    if (this.destroy === 1)
                        this.runtime.DestroyInstance(this.inst);
                }
            }
        }
    };
    behinstProto.doStart = function ()
    {
        this.stage = 0;
        this.stageTime.reset();
        if (this.fadeInTime === 0)
        {
            this.stage = 1;
            if (this.waitTime === 0)
                this.stage = 2;
        }
        else
        {
            this.inst.opacity = 0;
            this.runtime.redraw = true;
        }
    };
    function Cnds() {};
    Cnds.prototype.OnFadeOutEnd = function ()
    {
        return true;
    };
    behaviorProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.StartFade = function ()
    {
        if (this.stage === 3)
            this.doStart();
    };
    Acts.prototype.RestartFade = function ()
    {
        this.doStart();
    };
    behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.Platform = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.Platform.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    var ANIMMODE_STOPPED = 0;
    var ANIMMODE_MOVING = 1;
    var ANIMMODE_JUMPING = 2;
    var ANIMMODE_FALLING = 3;
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
        this.leftkey = false;
        this.rightkey = false;
        this.jumpkey = false;
        this.jumped = false;            // prevent bunnyhopping
        this.ignoreInput = false;
        this.simleft = false;
        this.simright = false;
        this.simjump = false;
        this.lastFloorObject = null;
        this.lastFloorX = 0;
        this.lastFloorY = 0;
        this.animMode = ANIMMODE_STOPPED;
        this.enabled = true;
        this.fallthrough = 0;           // fall through jump-thru.  >0 to disable, lasts a few ticks
        this.dx = 0;
        this.dy = 0;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.updateGravity = function()
    {
        this.downx = Math.cos(this.ga);
        this.downy = Math.sin(this.ga);
        this.rightx = Math.cos(this.ga - Math.PI / 2);
        this.righty = Math.sin(this.ga - Math.PI / 2);
        this.downx = cr.round6dp(this.downx);
        this.downy = cr.round6dp(this.downy);
        this.rightx = cr.round6dp(this.rightx);
        this.righty = cr.round6dp(this.righty);
        this.g1 = this.g;
        if (this.g < 0)
        {
            this.downx *= -1;
            this.downy *= -1;
            this.g = Math.abs(this.g);
        }
    };
    behinstProto.onCreate = function()
    {
        this.maxspeed = this.properties[0];
        this.acc = this.properties[1];
        this.dec = this.properties[2];
        this.jumpStrength = this.properties[3];
        this.g = this.properties[4];
        this.g1 = this.g;
        this.maxFall = this.properties[5];
        this.defaultControls = (this.properties[6] === 1);  // 0=no, 1=yes
        this.ga = cr.to_radians(90);
        this.updateGravity();
        if (this.defaultControls && !this.runtime.isDomFree)
        {
            jQuery(document).keydown(
                (function (self) {
                    return function(info) {
                        self.onKeyDown(info);
                    };
                })(this)
            );
            jQuery(document).keyup(
                (function (self) {
                    return function(info) {
                        self.onKeyUp(info);
                    };
                })(this)
            );
        }
        this.myDestroyCallback = (function (self) {
                                            return function(inst) {
                                                self.onInstanceDestroyed(inst);
                                            };
                                        })(this);
        this.runtime.addDestroyCallback(this.myDestroyCallback);
    };
    behinstProto.onInstanceDestroyed = function (inst)
    {
        if (this.lastFloorObject == inst)
            this.lastFloorObject = null;
    };
    behinstProto.onDestroy = function ()
    {
        this.lastFloorObject = null;
        this.runtime.removeDestroyCallback(this.myDestroyCallback);
    };
    behinstProto.onKeyDown = function (info)
    {
        switch (info.which) {
        case 38:    // up
            info.preventDefault();
            this.jumpkey = true;
            break;
        case 37:    // left
            info.preventDefault();
            this.leftkey = true;
            break;
        case 39:    // right
            info.preventDefault();
            this.rightkey = true;
            break;
        }
    };
    behinstProto.onKeyUp = function (info)
    {
        switch (info.which) {
        case 38:    // up
            info.preventDefault();
            this.jumpkey = false;
            this.jumped = false;
            break;
        case 37:    // left
            info.preventDefault();
            this.leftkey = false;
            break;
        case 39:    // right
            info.preventDefault();
            this.rightkey = false;
            break;
        }
    };
    behinstProto.getGDir = function ()
    {
        if (this.g < 0)
            return -1;
        else
            return 1;
    };
    behinstProto.isOnFloor = function ()
    {
        var ret = null;
        var ret2 = null;
        var i, len, j;
        var oldx = this.inst.x;
        var oldy = this.inst.y;
        this.inst.x += this.downx;
        this.inst.y += this.downy;
        this.inst.set_bbox_changed();
        if (this.lastFloorObject && this.runtime.testOverlap(this.inst, this.lastFloorObject))
        {
            this.inst.x = oldx;
            this.inst.y = oldy;
            this.inst.set_bbox_changed();
            return this.lastFloorObject;
        }
        else
        {
            ret = this.runtime.testOverlapSolid(this.inst);
            if (!ret && this.fallthrough === 0)
                ret2 = this.runtime.testOverlapJumpThru(this.inst, true);
            this.inst.x = oldx;
            this.inst.y = oldy;
            this.inst.set_bbox_changed();
            if (ret)        // was overlapping solid
            {
                if (this.runtime.testOverlap(this.inst, ret))
                    return null;
                else
                    return ret;
            }
            if (ret2 && ret2.length)
            {
                for (i = 0, j = 0, len = ret2.length; i < len; i++)
                {
                    ret2[j] = ret2[i];
                    if (!this.runtime.testOverlap(this.inst, ret2[i]))
                        j++;
                }
                if (j >= 1)
                    return ret2[0];
            }
            return null;
        }
    };
    behinstProto.tick = function ()
    {
        var dt = this.runtime.getDt(this.inst);
        var mx, my, obstacle, mag, allover, i, len, j, oldx, oldy;
        if (!this.jumpkey && !this.simjump)
            this.jumped = false;
        var left = this.leftkey || this.simleft;
        var right = this.rightkey || this.simright;
        var jump = (this.jumpkey || this.simjump) && !this.jumped;
        this.simleft = false;
        this.simright = false;
        this.simjump = false;
        if (!this.enabled)
            return;
        this.inst.x -= this.downx;
        this.inst.y -= this.downy;
        this.inst.set_bbox_changed();
        if (this.ignoreInput)
        {
            left = false;
            right = false;
            jump = false;
        }
        var lastFloor = this.lastFloorObject;
        var floor_moved = false;
        if (lastFloor && this.dy === 0 && (lastFloor.y !== this.lastFloorY || lastFloor.x !== this.lastFloorX))
        {
            mx = (lastFloor.x - this.lastFloorX);
            my = (lastFloor.y - this.lastFloorY);
            this.inst.x += mx;
            this.inst.y += my;
            this.inst.set_bbox_changed();
            this.lastFloorX = lastFloor.x;
            this.lastFloorY = lastFloor.y;
            floor_moved = true;
            if (this.runtime.testOverlapSolid(this.inst))
            {
                this.runtime.pushOutSolid(this.inst, -mx, -my, Math.sqrt(mx * mx + my * my) * 2.5);
            }
        }
        var floor_ = this.isOnFloor();
        var collobj = this.runtime.testOverlapSolid(this.inst);
        if (collobj)
        {
            if (this.runtime.pushOutSolidNearest(this.inst, Math.max(this.inst.width, this.inst.height) / 2))
                this.runtime.registerCollision(this.inst, collobj);
            else
            {
                this.inst.x += this.downx;
                this.inst.y += this.downy;
                this.inst.set_bbox_changed();
                return;
            }
        }
        if (floor_)
        {
            if (this.dy > 0)
                this.dy = 0;
            if (lastFloor != floor_)
            {
                this.lastFloorObject = floor_;
                this.lastFloorX = floor_.x;
                this.lastFloorY = floor_.y;
                this.runtime.registerCollision(this.inst, floor_);
            }
            else if (floor_moved)
            {
                collobj = this.runtime.testOverlapSolid(this.inst);
                if (collobj)
                {
                    this.runtime.registerCollision(this.inst, collobj);
                    if (mx !== 0)
                    {
                        if (mx > 0)
                            this.runtime.pushOutSolid(this.inst, -this.rightx, -this.righty);
                        else
                            this.runtime.pushOutSolid(this.inst, this.rightx, this.righty);
                    }
                    this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy);
                }
            }
            if (jump)
            {
                this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnJump, this.inst);
                this.animMode = ANIMMODE_JUMPING;
                this.dy = -this.jumpStrength;
                this.jumped = true;
            }
        }
        else
        {
            this.lastFloorObject = null;
            this.dy += this.g * dt;
            if (this.dy > this.maxFall)
                this.dy = this.maxFall;
            if (jump)
                this.jumped = true;
        }
        if (left == right)  // both up or both down
        {
            if (this.dx < 0)
            {
                this.dx += this.dec * dt;
                if (this.dx > 0)
                    this.dx = 0;
            }
            else if (this.dx > 0)
            {
                this.dx -= this.dec * dt;
                if (this.dx < 0)
                    this.dx = 0;
            }
        }
        if (left && !right)
        {
            if (this.dx > 0)
                this.dx -= (this.acc + this.dec) * dt;
            else
                this.dx -= this.acc * dt;
        }
        if (right && !left)
        {
            if (this.dx < 0)
                this.dx += (this.acc + this.dec) * dt;
            else
                this.dx += this.acc * dt;
        }
        if (this.dx > this.maxspeed)
            this.dx = this.maxspeed;
        else if (this.dx < -this.maxspeed)
            this.dx = -this.maxspeed;
        if (this.dx !== 0)
        {
            oldx = this.inst.x;
            oldy = this.inst.y;
            mx = this.dx * dt * this.rightx;
            my = this.dx * dt * this.righty;
            this.inst.x += this.rightx * (this.dx > 1 ? 1 : -1) - this.downx;
            this.inst.y += this.righty * (this.dx > 1 ? 1 : -1) - this.downy;
            this.inst.set_bbox_changed();
            var is_jumpthru = false;
            var slope_too_steep = this.runtime.testOverlapSolid(this.inst);
            /*
            if (!slope_too_steep && floor_)
            {
                slope_too_steep = this.runtime.testOverlapJumpThru(this.inst);
                is_jumpthru = true;
                if (slope_too_steep)
                {
                    this.inst.x = oldx;
                    this.inst.y = oldy;
                    this.inst.set_bbox_changed();
                    if (this.runtime.testOverlap(this.inst, slope_too_steep))
                    {
                        slope_too_steep = null;
                        is_jumpthru = false;
                    }
                }
            }
            */
            this.inst.x = oldx + mx;
            this.inst.y = oldy + my;
            this.inst.set_bbox_changed();
            obstacle = this.runtime.testOverlapSolid(this.inst);
            if (!obstacle && floor_)
            {
                obstacle = this.runtime.testOverlapJumpThru(this.inst);
                if (obstacle)
                {
                    this.inst.x = oldx;
                    this.inst.y = oldy;
                    this.inst.set_bbox_changed();
                    if (this.runtime.testOverlap(this.inst, obstacle))
                    {
                        obstacle = null;
                        is_jumpthru = false;
                    }
                    else
                        is_jumpthru = true;
                    this.inst.x = oldx + mx;
                    this.inst.y = oldy + my;
                    this.inst.set_bbox_changed();
                }
            }
            if (obstacle)
            {
                var push_dist = Math.abs(this.dx * dt) + 2;
                if (slope_too_steep || !this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, push_dist, is_jumpthru, obstacle))
                {
                    this.runtime.registerCollision(this.inst, obstacle);
                    push_dist = Math.max(Math.abs(this.dx * dt * 2.5), 30);
                    if (!this.runtime.pushOutSolid(this.inst, this.rightx * (this.dx < 0 ? 1 : -1), this.righty * (this.dx < 0 ? 1 : -1), push_dist, false))
                    {
                        this.inst.x = oldx;
                        this.inst.y = oldy;
                        this.inst.set_bbox_changed();
                    }
                    else if (Math.abs(this.inst.x - oldx) < 1 && !is_jumpthru)
                    {
                        this.inst.x = oldx;
                        this.inst.y = oldy;
                        this.inst.set_bbox_changed();
                    }
                    if (!is_jumpthru)
                        this.dx = 0;    // stop
                }
            }
            else if (floor_ && !this.isOnFloor())
            {
                mag = Math.ceil(Math.abs(this.dx * dt)) + 2;
                oldx = this.inst.x;
                oldy = this.inst.y;
                this.inst.x += this.downx * mag;
                this.inst.y += this.downy * mag;
                this.inst.set_bbox_changed();
                if (this.runtime.testOverlapSolid(this.inst) || this.runtime.testOverlapJumpThru(this.inst))
                    this.runtime.pushOutSolid(this.inst, -this.downx, -this.downy, mag + 2, true);
                else
                {
                    this.inst.x = oldx;
                    this.inst.y = oldy;
                    this.inst.set_bbox_changed();
                }
            }
        }
        var landed = false;
        if (this.dy !== 0)
        {
            oldx = this.inst.x;
            oldy = this.inst.y;
            this.inst.x += this.dy * dt * this.downx;
            this.inst.y += this.dy * dt * this.downy;
            var newx = this.inst.x;
            var newy = this.inst.y;
            this.inst.set_bbox_changed();
            collobj = this.runtime.testOverlapSolid(this.inst);
            var fell_on_jumpthru = false;
            if (!collobj && (this.dy > 0) && !floor_)
            {
                allover = this.fallthrough > 0 ? null : this.runtime.testOverlapJumpThru(this.inst, true);
                if (allover && allover.length)
                {
                    this.inst.x = oldx;
                    this.inst.y = oldy;
                    this.inst.set_bbox_changed();
                    for (i = 0, j = 0, len = allover.length; i < len; i++)
                    {
                        allover[j] = allover[i];
                        if (!this.runtime.testOverlap(this.inst, allover[i]))
                            j++;
                    }
                    allover.length = j;
                    this.inst.x = newx;
                    this.inst.y = newy;
                    this.inst.set_bbox_changed();
                    if (allover.length >= 1)
                        collobj = allover[0];
                }
                fell_on_jumpthru = !!collobj;
            }
            if (collobj)
            {
                this.runtime.registerCollision(this.inst, collobj);
                var push_dist = Math.max(Math.abs(this.dy * dt * 2.5 + 10), 30);
                if (!this.runtime.pushOutSolid(this.inst, this.downx * (this.dy < 0 ? 1 : -1), this.downy * (this.dy < 0 ? 1 : -1), push_dist, fell_on_jumpthru, collobj))
                {
                    this.inst.x = oldx;
                    this.inst.y = oldy;
                    this.inst.set_bbox_changed();
                }
                else
                {
                    this.lastFloorObject = collobj;
                    this.lastFloorX = collobj.x;
                    this.lastFloorY = collobj.y;
                    if (fell_on_jumpthru)
                        landed = true;
                }
                this.dy = 0;    // stop
            }
        }
        this.inst.x += this.downx;
        this.inst.y += this.downy;
        this.inst.set_bbox_changed();
        if (this.animMode !== ANIMMODE_FALLING && this.dy > 0 && !floor_)
        {
            this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnFall, this.inst);
            this.animMode = ANIMMODE_FALLING;
        }
        if (floor_ || landed)
        {
            if (this.animMode === ANIMMODE_FALLING || landed || (jump && this.dy === 0))
            {
                this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnLand, this.inst);
                if (this.dx === 0 && this.dy === 0)
                    this.animMode = ANIMMODE_STOPPED;
                else
                    this.animMode = ANIMMODE_MOVING;
            }
            else
            {
                if (this.animMode !== ANIMMODE_STOPPED && this.dx === 0 && this.dy === 0)
                {
                    this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnStop, this.inst);
                    this.animMode = ANIMMODE_STOPPED;
                }
                if (this.animMode !== ANIMMODE_MOVING && (this.dx !== 0 || this.dy !== 0) && !jump)
                {
                    this.runtime.trigger(cr.behaviors.Platform.prototype.cnds.OnMove, this.inst);
                    this.animMode = ANIMMODE_MOVING;
                }
            }
        }
        if (this.fallthrough > 0)
            this.fallthrough--;
    };
    function Cnds() {};
    Cnds.prototype.IsMoving = function ()
    {
        return this.dx !== 0 || this.dy !== 0;
    };
    Cnds.prototype.CompareSpeed = function (cmp, s)
    {
        var speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        return cr.do_cmp(speed, cmp, s);
    };
    Cnds.prototype.IsOnFloor = function ()
    {
        if (this.dy !== 0)
            return false;
        var overlapSolid = this.runtime.testOverlapSolid(this.inst);
        var overlapJumpThru = null;
        var i, len, j;
        if (!overlapSolid)
        {
            overlapJumpThru = this.runtime.testOverlapJumpThru(this.inst, true);
            if (!overlapJumpThru || !overlapJumpThru.length)
                return false;
        }
        var ret = false;
        var oldx = this.inst.x;
        var oldy = this.inst.y;
        this.inst.x -= this.downx;
        this.inst.y -= this.downy;
        this.inst.set_bbox_changed();
        if (overlapSolid)
        {
            ret = !this.runtime.testOverlapSolid(this.inst);
        }
        else
        {
            for (i = 0, j = 0, len = overlapJumpThru.length; i < len; i++)
            {
                overlapJumpThru[j] = overlapJumpThru[i];
                if (!this.runtime.testOverlap(this.inst, overlapJumpThru[i]))
                    j++;
            }
            if (j >= 1)
                ret = true;
        }
        this.inst.x = oldx;
        this.inst.y = oldy;
        this.inst.set_bbox_changed();
        return ret;
    };
    Cnds.prototype.IsByWall = function (side)
    {
        var ret = false;
        var oldx = this.inst.x;
        var oldy = this.inst.y;
        this.inst.x -= this.downx * 3;
        this.inst.y -= this.downy * 3;
        this.inst.set_bbox_changed();
        if (this.runtime.testOverlapSolid(this.inst))
        {
            this.inst.x = oldx;
            this.inst.y = oldy;
            this.inst.set_bbox_changed();
            return false;
        }
        if (side === 0)     // left
        {
            this.inst.x -= this.rightx * 2;
            this.inst.y -= this.righty * 2;
        }
        else
        {
            this.inst.x += this.rightx * 2;
            this.inst.y += this.righty * 2;
        }
        this.inst.set_bbox_changed();
        ret = this.runtime.testOverlapSolid(this.inst);
        this.inst.x = oldx;
        this.inst.y = oldy;
        this.inst.set_bbox_changed();
        return ret;
    };
    Cnds.prototype.IsJumping = function ()
    {
        return this.dy < 0;
    };
    Cnds.prototype.IsFalling = function ()
    {
        return this.dy > 0;
    };
    Cnds.prototype.OnJump = function ()
    {
        return true;
    };
    Cnds.prototype.OnFall = function ()
    {
        return true;
    };
    Cnds.prototype.OnStop = function ()
    {
        return true;
    };
    Cnds.prototype.OnMove = function ()
    {
        return true;
    };
    Cnds.prototype.OnLand = function ()
    {
        return true;
    };
    behaviorProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetIgnoreInput = function (ignoring)
    {
        this.ignoreInput = ignoring;
    };
    Acts.prototype.SetMaxSpeed = function (maxspeed)
    {
        this.maxspeed = maxspeed;
        if (this.maxspeed < 0)
            this.maxspeed = 0;
    };
    Acts.prototype.SetAcceleration = function (acc)
    {
        this.acc = acc;
        if (this.acc < 0)
            this.acc = 0;
    };
    Acts.prototype.SetDeceleration = function (dec)
    {
        this.dec = dec;
        if (this.dec < 0)
            this.dec = 0;
    };
    Acts.prototype.SetJumpStrength = function (js)
    {
        this.jumpStrength = js;
        if (this.jumpStrength < 0)
            this.jumpStrength = 0;
    };
    Acts.prototype.SetGravity = function (grav)
    {
        if (this.g1 === grav)
            return;     // no change
        this.g = grav;
        this.updateGravity();
        if (this.runtime.testOverlapSolid(this.inst))
        {
            this.runtime.pushOutSolid(this.inst, this.downx, this.downy, 10);
            this.inst.x += this.downx * 2;
            this.inst.y += this.downy * 2;
            this.inst.set_bbox_changed();
        }
        this.lastFloorObject = null;
    };
    Acts.prototype.SetMaxFallSpeed = function (mfs)
    {
        this.maxFall = mfs;
        if (this.maxFall < 0)
            this.maxFall = 0;
    };
    Acts.prototype.SimulateControl = function (ctrl)
    {
        switch (ctrl) {
        case 0:     this.simleft = true;    break;
        case 1:     this.simright = true;   break;
        case 2:     this.simjump = true;    break;
        }
    };
    Acts.prototype.SetVectorX = function (vx)
    {
        this.dx = vx;
    };
    Acts.prototype.SetVectorY = function (vy)
    {
        this.dy = vy;
    };
    Acts.prototype.SetGravityAngle = function (a)
    {
        a = cr.to_radians(a);
        a = cr.clamp_angle(a);
        if (this.ga === a)
            return;     // no change
        this.ga = a;
        this.updateGravity();
        this.lastFloorObject = null;
    };
    Acts.prototype.SetEnabled = function (en)
    {
        this.enabled = (en === 1);
    };
    Acts.prototype.FallThrough = function ()
    {
        if (!this.runtime.testOverlapJumpThru(this.inst, false))
            return;
        this.fallthrough = 3;           // disable jumpthrus for 3 ticks (1 doesn't do it, 2 does, 3 to be on safe side)
        this.lastFloorObject = null;
    };
    behaviorProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.Speed = function (ret)
    {
        ret.set_float(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
    };
    Exps.prototype.MaxSpeed = function (ret)
    {
        ret.set_float(this.maxspeed);
    };
    Exps.prototype.Acceleration = function (ret)
    {
        ret.set_float(this.acc);
    };
    Exps.prototype.Deceleration = function (ret)
    {
        ret.set_float(this.dec);
    };
    Exps.prototype.JumpStrength = function (ret)
    {
        ret.set_float(this.jumpStrength);
    };
    Exps.prototype.Gravity = function (ret)
    {
        ret.set_float(this.g);
    };
    Exps.prototype.MaxFallSpeed = function (ret)
    {
        ret.set_float(this.maxFall);
    };
    Exps.prototype.MovingAngle = function (ret)
    {
        ret.set_float(cr.to_degrees(Math.atan2(this.dy, this.dx)));
    };
    Exps.prototype.VectorX = function (ret)
    {
        ret.set_float(this.dx);
    };
    Exps.prototype.VectorY = function (ret)
    {
        ret.set_float(this.dy);
    };
    behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Rex_pushOutSolid = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.Rex_pushOutSolid.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
        this.canvas_type = null;
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;
        this.runtime = type.runtime;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
        this.activated = (this.properties[0] == 1);
    };
    behinstProto.onDestroy = function()
    {
    };
    behinstProto.tick = function ()
    {
        if (!this.activated)
            return;
        var collobj = this.runtime.testOverlapSolid(this.inst);
        if (collobj)
        {
            this.runtime.registerCollision(this.inst, collobj);
            this.runtime.pushOutSolidNearest(this.inst);
        }
    };
    function Cnds() {};
    behaviorProto.cnds = new Cnds();
    function Acts() {};
    behaviorProto.acts = new Acts();
    Acts.prototype.SetActivated = function (s)
    {
        this.activated = (s==1);
    };
    function Exps() {};
    behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Sin = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.Sin.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
        this.i = 0;     // period offset (radians)
    };
    var behinstProto = behaviorProto.Instance.prototype;
    var _2pi = 2 * Math.PI;
    var _pi_2 = Math.PI / 2;
    var _3pi_2 = (3 * Math.PI) / 2;
    behinstProto.onCreate = function()
    {
        this.active = (this.properties[0] === 1);
        this.movement = this.properties[1]; // 0=Horizontal|1=Vertical|2=Size|3=Width|4=Height|5=Angle|6=Opacity|7=Value only
        this.wave = this.properties[2];     // 0=Sine|1=Triangle|2=Sawtooth|3=Reverse sawtooth|4=Square
        this.period = this.properties[3];
        this.period += Math.random() * this.properties[4];                              // period random
        if (this.period === 0)
            this.i = 0;
        else
        {
            this.i = (this.properties[5] / this.period) * _2pi;                             // period offset
            this.i += ((Math.random() * this.properties[6]) / this.period) * _2pi;          // period offset random
        }
        this.mag = this.properties[7];                                                  // magnitude
        this.mag += Math.random() * this.properties[8];                                 // magnitude random
        this.initialValue = 0;
        this.ratio = 0;
        this.init();
    };
    behinstProto.init = function ()
    {
        switch (this.movement) {
        case 0:     // horizontal
            this.initialValue = this.inst.x;
            break;
        case 1:     // vertical
            this.initialValue = this.inst.y;
            break;
        case 2:     // size
            this.initialValue = this.inst.width;
            this.ratio = this.inst.height / this.inst.width;
            break;
        case 3:     // width
            this.initialValue = this.inst.width;
            break;
        case 4:     // height
            this.initialValue = this.inst.height;
            break;
        case 5:     // angle
            this.initialValue = this.inst.angle;
            this.mag = cr.to_radians(this.mag);     // convert magnitude from degrees to radians
            break;
        case 6:     // opacity
            this.initialValue = this.inst.opacity;
            break;
        case 7:
            this.initialValue = 0;
            break;
        default:
;
        }
        this.lastKnownValue = this.initialValue;
    };
    behinstProto.waveFunc = function (x)
    {
        x = x % _2pi;
        switch (this.wave) {
        case 0:     // sine
            return Math.sin(x);
        case 1:     // triangle
            if (x <= _pi_2)
                return x / _pi_2;
            else if (x <= _3pi_2)
                return 1 - (2 * (x - _pi_2) / Math.PI);
            else
                return (x - _3pi_2) / _pi_2 - 1;
        case 2:     // sawtooth
            return 2 * x / _2pi - 1;
        case 3:     // reverse sawtooth
            return -2 * x / _2pi + 1;
        case 4:     // square
            return x < Math.PI ? -1 : 1;
        };
        return 0;
    };
    behinstProto.tick = function ()
    {
    };
    behinstProto.tick2 = function ()
    {
        var dt = this.runtime.getDt(this.inst);
        if (!this.active || dt === 0)
            return;
        if (this.period === 0)
            this.i = 0;
        else
        {
            this.i += (dt / this.period) * _2pi;
            this.i = this.i % _2pi;
        }
        switch (this.movement) {
        case 0:     // horizontal
            if (this.inst.x !== this.lastKnownValue)
                this.initialValue += this.inst.x - this.lastKnownValue;
            this.inst.x = this.initialValue + this.waveFunc(this.i) * this.mag;
            this.lastKnownValue = this.inst.x;
            break;
        case 1:     // vertical
            if (this.inst.y !== this.lastKnownValue)
                this.initialValue += this.inst.y - this.lastKnownValue;
            this.inst.y = this.initialValue + this.waveFunc(this.i) * this.mag;
            this.lastKnownValue = this.inst.y;
            break;
        case 2:     // size
            this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
            this.inst.height = this.inst.width * this.ratio;
            break;
        case 3:     // width
            this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
            break;
        case 4:     // height
            this.inst.height = this.initialValue + this.waveFunc(this.i) * this.mag;
            break;
        case 5:     // angle
            if (this.inst.angle !== this.lastKnownValue)
                this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));
            this.inst.angle = cr.clamp_angle(this.initialValue + this.waveFunc(this.i) * this.mag);
            this.lastKnownValue = this.inst.angle;
            break;
        case 6:     // opacity
            this.inst.opacity = this.initialValue + (this.waveFunc(this.i) * this.mag) / 100;
            if (this.inst.opacity < 0)
                this.inst.opacity = 0;
            else if (this.inst.opacity > 1)
                this.inst.opacity = 1;
            break;
        }
        this.inst.set_bbox_changed();
    };
    behinstProto.onSpriteFrameChanged = function (prev_frame, next_frame)
    {
        switch (this.movement) {
        case 2: // size
            this.initialValue *= (next_frame.width / prev_frame.width);
            this.ratio = next_frame.height / next_frame.width;
            break;
        case 3: // width
            this.initialValue *= (next_frame.width / prev_frame.width);
            break;
        case 4: // height
            this.initialValue *= (next_frame.height / prev_frame.height);
            break;
        }
    };
    function Cnds() {};
    Cnds.prototype.IsActive = function ()
    {
        return this.active;
    };
    Cnds.prototype.CompareMovement = function (m)
    {
        return this.movement === m;
    };
    Cnds.prototype.ComparePeriod = function (cmp, v)
    {
        return cr.do_cmp(this.period, cmp, v);
    };
    Cnds.prototype.CompareMagnitude = function (cmp, v)
    {
        if (this.movement === 5)
            return cr.do_cmp(this.mag, cmp, cr.to_radians(v));
        else
            return cr.do_cmp(this.mag, cmp, v);
    };
    Cnds.prototype.CompareWave = function (w)
    {
        return this.wave === w;
    };
    behaviorProto.cnds = new Cnds();
    function Acts() {};
    Acts.prototype.SetActive = function (a)
    {
        this.active = (a === 1);
    };
    Acts.prototype.SetPeriod = function (x)
    {
        this.period = x;
    };
    Acts.prototype.SetMagnitude = function (x)
    {
        this.mag = x;
        if (this.movement === 5)    // angle
            this.mag = cr.to_radians(this.mag);
    };
    Acts.prototype.SetMovement = function (m)
    {
        if (this.movement === 5)
            this.mag = cr.to_degrees(this.mag);
        this.movement = m;
        this.init();
    };
    Acts.prototype.SetWave = function (w)
    {
        this.wave = w;
    };
    behaviorProto.acts = new Acts();
    function Exps() {};
    Exps.prototype.CyclePosition = function (ret)
    {
        ret.set_float(this.i / _2pi);
    };
    Exps.prototype.Period = function (ret)
    {
        ret.set_float(this.period);
    };
    Exps.prototype.Magnitude = function (ret)
    {
        if (this.movement === 5)    // angle
            ret.set_float(cr.to_degrees(this.mag));
        else
            ret.set_float(this.mag);
    };
    Exps.prototype.Value = function (ret)
    {
        ret.set_float(this.waveFunc(this.i) * this.mag);
    };
    behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.destroy = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.destroy.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
    };
    behinstProto.tick = function ()
    {
        this.inst.update_bbox();
        var bbox = this.inst.bbox;
        var layout = this.inst.layer.layout;
        if (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height)
            this.runtime.DestroyInstance(this.inst);
    };
}());
;
;
cr.behaviors.jumpthru = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.jumpthru.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
        this.inst.extra.jumpthruEnabled = true;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
    };
    behinstProto.tick = function ()
    {
    };
    function Acts() {};
    Acts.prototype.SetEnabled = function (e)
    {
        this.inst.extra.jumpthruEnabled = !!e;
    };
    behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.scrollto = function(runtime)
{
    this.runtime = runtime;
    this.shakeMag = 0;
    this.shakeStart = 0;
    this.shakeEnd = 0;
    this.shakeMode = 0;
};
(function ()
{
    var behaviorProto = cr.behaviors.scrollto.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
    };
    behinstProto.tick = function ()
    {
    };
    behinstProto.tick2 = function ()
    {
        var all = this.behavior.my_instances.values();
        var sumx = 0, sumy = 0;
        var i, len;
        for (i = 0, len = all.length; i < len; i++)
        {
            sumx += all[i].x;
            sumy += all[i].y;
        }
        var layout = this.inst.layer.layout;
        var now = this.runtime.kahanTime.sum;
        var offx = 0, offy = 0;
        if (now >= this.behavior.shakeStart && now < this.behavior.shakeEnd)
        {
            var mag = this.behavior.shakeMag * Math.min(this.runtime.timescale, 1);
            if (this.behavior.shakeMode === 0)
                mag *= 1 - (now - this.behavior.shakeStart) / (this.behavior.shakeEnd - this.behavior.shakeStart);
            var a = Math.random() * Math.PI * 2;
            var d = Math.random() * mag;
            offx = Math.cos(a) * d;
            offy = Math.sin(a) * d;
        }
        layout.scrollToX(sumx / all.length + offx);
        layout.scrollToY(sumy / all.length + offy);
    };
    function Acts() {};
    Acts.prototype.Shake = function (mag, dur, mode)
    {
        this.behavior.shakeMag = mag;
        this.behavior.shakeStart = this.runtime.kahanTime.sum;
        this.behavior.shakeEnd = this.behavior.shakeStart + dur;
        this.behavior.shakeMode = mode;
    };
    behaviorProto.acts = new Acts();
}());
;
;
cr.behaviors.solid = function(runtime)
{
    this.runtime = runtime;
};
(function ()
{
    var behaviorProto = cr.behaviors.solid.prototype;
    behaviorProto.Type = function(behavior, objtype)
    {
        this.behavior = behavior;
        this.objtype = objtype;
        this.runtime = behavior.runtime;
    };
    var behtypeProto = behaviorProto.Type.prototype;
    behtypeProto.onCreate = function()
    {
    };
    behaviorProto.Instance = function(type, inst)
    {
        this.type = type;
        this.behavior = type.behavior;
        this.inst = inst;               // associated object instance to modify
        this.runtime = type.runtime;
        this.inst.extra.solidEnabled = true;
    };
    var behinstProto = behaviorProto.Instance.prototype;
    behinstProto.onCreate = function()
    {
    };
    behinstProto.tick = function ()
    {
    };
    function Acts() {};
    Acts.prototype.SetEnabled = function (e)
    {
        this.inst.extra.solidEnabled = !!e;
    };
    behaviorProto.acts = new Acts();
}());
cr.getProjectModel = function() { return [
    null,
    "L1",
    [
    [
        cr.plugins_.Browser,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
,   [
        cr.plugins_.Audio,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
,   [
        cr.plugins_.CJSAds,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
,   [
        cr.plugins_.Keyboard,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
,   [
        cr.plugins_.Particles,
        false,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true
    ]
,   [
        cr.plugins_.Sprite,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false
    ]
,   [
        cr.plugins_.Text,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false
    ]
,   [
        cr.plugins_.TiledBg,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true
    ]
,   [
        cr.plugins_.Touch,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
,   [
        cr.plugins_.WebStorage,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ]
    ],
    [
    [
        "t0",
        cr.plugins_.TiledBg,
        false,
        0,
        0,
        0,
        ["images/backgroundtile.png", 132],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t1",
        cr.plugins_.Sprite,
        false,
        2,
        2,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/player-sheet0.png", 192, 0, 0, 32, 32, 1, 0.5, 0.5,[],[]]
            ]
            ]
        ],
        [
        [
            "Platform",
            cr.behaviors.Platform
        ]
,       [
            "ScrollTo",
            cr.behaviors.scrollto
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t2",
        cr.plugins_.TiledBg,
        false,
        0,
        1,
        0,
        ["images/solidtile.png", 122],
        null,
        [
        [
            "Solid",
            cr.behaviors.solid
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t3",
        cr.plugins_.TiledBg,
        false,
        0,
        2,
        0,
        ["images/movingsolidtileupdown.png", 122],
        null,
        [
        [
            "Solid",
            cr.behaviors.solid
        ]
,       [
            "Sine",
            cr.behaviors.Sin
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t4",
        cr.plugins_.TiledBg,
        false,
        0,
        1,
        0,
        ["images/jumpthrutile.png", 120],
        null,
        [
        [
            "Jumpthru",
            cr.behaviors.jumpthru
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t5",
        cr.plugins_.Keyboard,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[]
    ]
,   [
        "t6",
        cr.plugins_.Text,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t7",
        cr.plugins_.WebStorage,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[]
    ]
,   [
        "t8",
        cr.plugins_.CJSAds,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[]
    ]
,   [
        "t9",
        cr.plugins_.Touch,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[1]
    ]
,   [
        "t10",
        cr.plugins_.Browser,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[]
    ]
,   [
        "t11",
        cr.plugins_.Audio,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
        ,[0]
    ]
,   [
        "t12",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            2,
            true,
            1,
            0,
            false,
            [
                ["images/card_chip_gold-sheet0.png", 1069, 0, 0, 32, 32, 1, 0.5, 0.5,[],[-0.40625,-0.40625,0,-0.4375,0.40625,-0.40625,0.4375,0,0.375,0.375,0,0.40625,-0.375,0.375,-0.46875,0]],
                ["images/card_chip_gold-sheet1.png", 612, 0, 0, 32, 32, 1, 0.5, 0.5,[],[-0.40625,-0.40625,0,-0.4375,0.40625,-0.40625,0.4375,0,0.375,0.375,0,0.40625,-0.375,0.375,-0.46875,0]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t13",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/sprite-sheet0.png", 273, 0, 0, 44, 42, 1, 0.5, 0.190476,[["Imagepoint 1", 1, 0.190476]],[0.0625,0.809524,-0.318182,0.809524,-0.153409,-0.142857]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t14",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/sprite2-sheet0.png", 168, 0, 0, 54, 70, 1, 1.05556, 0.342857,[],[]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t15",
        cr.plugins_.Sprite,
        false,
        0,
        1,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/sprite3-sheet0.png", 118, 0, 0, 60, 9, 1, 0.783333, -0.777778,[],[-0.316666,1.11111,-0.240625,1.10417,-0.241666,1.41667,-0.315625,1.40972]]
            ]
            ]
        ],
        [
        [
            "Sine",
            cr.behaviors.Sin
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t16",
        cr.plugins_.Particles,
        false,
        0,
        0,
        0,
        ["images/particles.png", 858],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t17",
        cr.plugins_.Sprite,
        false,
        0,
        2,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/enemyshoot-sheet0.png", 775, 0, 0, 33, 33, 1, 0.515152, 0.484848,[],[-0.515152,-0.00757551,0.484848,-0.484848,0.484848,0.515152]]
            ]
            ]
        ],
        [
        [
            "Bullet",
            cr.behaviors.Bullet
        ]
,       [
            "DestroyOutsideLayout",
            cr.behaviors.destroy
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t18",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/mirrored-sheet0.png", 664, 0, 0, 21, 21, 1, 0.333333, 0.238095,[],[]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t19",
        cr.plugins_.Particles,
        false,
        0,
        0,
        0,
        ["images/particles2.png", 115],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t20",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/mine-sheet0.png", 133, 0, 0, 48, 20, 1, 0.5, 0.2,[],[-0.01302,-0.125,0.463542,0.725,-0.46875,0.725]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t21",
        cr.plugins_.Particles,
        false,
        0,
        0,
        0,
        ["images/particles3.png", 113],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t22",
        cr.plugins_.TiledBg,
        false,
        0,
        0,
        0,
        ["images/tiledbackgroundlava.png", 114],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t23",
        cr.plugins_.Particles,
        false,
        0,
        0,
        0,
        ["images/particles4.png", 92],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t24",
        cr.plugins_.Sprite,
        false,
        0,
        1,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/explosion-sheet0.png", 112, 0, 0, 66, 66, 1, 0.5, 0.5,[],[]]
            ]
            ]
        ],
        [
        [
            "Fade",
            cr.behaviors.Fade
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t25",
        cr.plugins_.TiledBg,
        false,
        0,
        0,
        0,
        ["images/solidtile2opacity.png", 122],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t26",
        cr.plugins_.Text,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t27",
        cr.plugins_.Text,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t28",
        cr.plugins_.Text,
        false,
        0,
        0,
        0,
        null,
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t29",
        cr.plugins_.Sprite,
        false,
        0,
        1,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/sprite4-sheet0.png", 280, 0, 0, 112, 78, 1, 0.330357, 0.576923,[],[]]
            ]
            ]
        ],
        [
        [
            "Sine",
            cr.behaviors.Sin
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t30",
        cr.plugins_.Sprite,
        false,
        1,
        1,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/dog-sheet0.png", 273, 0, 0, 32, 32, 1, 0.5, 1,[],[]]
            ]
            ]
        ],
        [
        [
            "Platform",
            cr.behaviors.Platform
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t31",
        cr.plugins_.Sprite,
        false,
        0,
        1,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/jumper-sheet0.png", 173, 0, 0, 16, 16, 1, 0.5, 1,[],[]]
            ]
            ]
        ],
        [
        [
            "Fade",
            cr.behaviors.Fade
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t32",
        cr.plugins_.Sprite,
        false,
        0,
        1,
        0,
        null,
        [
            [
            "Default",
            2,
            true,
            1,
            0,
            false,
            [
                ["images/sprezyna-sheet0.png", 377, 0, 0, 32, 32, 1, 0.5, 1,[],[0.210938,-0.242187,0.5,0,-0.460938,0,-0.25,-0.234375]]
            ]
            ]
        ],
        [
        [
            "Sine",
            cr.behaviors.Sin
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t33",
        cr.plugins_.Sprite,
        false,
        0,
        2,
        0,
        null,
        [
            [
            "Default",
            5,
            false,
            1,
            0,
            false,
            [
                ["images/sprite5-sheet0.png", 221, 0, 0, 32, 32, 1, 0.5, 0.5,[],[]]
            ]
            ]
        ],
        [
        [
            "PushOutSolid",
            cr.behaviors.Rex_pushOutSolid
        ]
,       [
            "Solid",
            cr.behaviors.solid
        ]
        ],
        false,
        false,
        []
    ]
,   [
        "t34",
        cr.plugins_.Particles,
        false,
        0,
        0,
        0,
        ["images/particles5.png", 113],
        null,
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t35",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            true,
            1,
            0,
            true,
            [
                ["images/teleport-sheet0.png", 1347, 1, 1, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.03125, 0.484375]],[]],
                ["images/teleport-sheet0.png", 1347, 34, 1, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.03125, 0.484375]],[]],
                ["images/teleport-sheet0.png", 1347, 67, 1, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.03125, 0.484375]],[]],
                ["images/teleport-sheet1.png", 520, 0, 0, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.03125, 0.484375]],[]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t36",
        cr.plugins_.Sprite,
        false,
        0,
        0,
        0,
        null,
        [
            [
            "Default",
            5,
            true,
            1,
            0,
            true,
            [
                ["images/teleport2-sheet0.png", 1347, 1, 1, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.1875, 0.46875]],[]],
                ["images/teleport2-sheet0.png", 1347, 34, 1, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.1875, 0.46875]],[]],
                ["images/teleport2-sheet0.png", 1347, 67, 1, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.1875, 0.46875]],[]],
                ["images/teleport2-sheet1.png", 520, 0, 0, 32, 64, 1, 0.5, 0.5,[["Imagepoint 1", 2.1875, 0.46875]],[]]
            ]
            ]
        ],
        [
        ],
        false,
        false,
        []
    ]
,   [
        "t37",
        cr.plugins_.Particles,
        false,
        0,
        0,
        0,
        ["images/particles6.png", 118],
        null,
        [
        ],
        false,
        false,
        []
    ]
    ],
    [
    ],
    [
    [
        "L1",
        1280,
        1024,
        false,
        "Event sheet 1",
        [
        [
            "Background",
            0,
            true,
            [0, 0, 153],
            false,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            ],
            [           ]
        ]
,       [
            "Layer 0",
            1,
            true,
            [255, 255, 255],
            true,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [-3, -5, 0, 1280, 1024, 0, 0, 1, 0, 0, 1, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 1",
            2,
            true,
            [255, 255, 255],
            true,
            0.4,
            0.4,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [108, 181, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [542, 476, 0, 787, 191, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 2",
            3,
            true,
            [255, 255, 255],
            true,
            0.6,
            0.6,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [505, 533, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 3",
            4,
            true,
            [255, 255, 255],
            true,
            0.8,
            0.8,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [753, 292, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [501.429, 686.692, 0, 80, 48, 0, 0, 1, 0.330357, 0.576923, 1, 0, []],
                29,
                [
                ],
                [
                [
                    1,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    11,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1024, 640, 0, 80, 48, 0, -1.55087, 1, 0.330357, 0.576923, 1, 0, []],
                29,
                [
                ],
                [
                [
                    1,
                    1,
                    0,
                    1,
                    0,
                    0,
                    0,
                    11,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [864, 400, 0, 80, 48, 0, -3.12968, 1, 0.330357, 0.576923, 1, 0, []],
                29,
                [
                ],
                [
                [
                    1,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    11,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 288, 0, 80, 48, 0, -1.55087, 1, 0.330357, 0.576923, 1, 0, []],
                29,
                [
                ],
                [
                [
                    1,
                    1,
                    0,
                    1,
                    0,
                    0,
                    0,
                    11,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [896, 112, 0, 48, 32, 0, 0, 1, 0.330357, 0.576923, 1, 0, []],
                29,
                [
                ],
                [
                [
                    1,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    11,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Game",
            5,
            true,
            [255, 255, 255],
            true,
            1,
            1,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [106, 531, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                1,
                [
                    0,
                    0
                ],
                [
                [
                    330,
                    1500,
                    1500,
                    650,
                    1500,
                    1000,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [64, 768, 0, 320, 128, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [864, 800, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1088, 736, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [992, 928, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [544, 800, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 624, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 528, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624.159, 432.067, 0, 372.035, 32, 0, 0.174533, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [528, 432, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [346, 339, 0, 219, 32, 0, 0.453596, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 224, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 336, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [320, 160, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [512, 128, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [755, 180, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 192, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [928, 288, 0, 96, 16, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 720, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 608, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 512, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [944, 464, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [832, 448, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [736, 432, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624, 416, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1135, 147, 0, 54, 70, 0, 0, 1, 1.05556, 0.342857, 0, 0, []],
                14,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1118, 139, 0, 42, 16, 0, 0, 1, 0.783333, -0.777778, 1, 0, []],
                15,
                [
                ],
                [
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    22,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1099, 190, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -99,
                    0,
                    800,
                    0,
                    0,
                    2
                ]
            ]
,           [
                [1121, 192, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -111,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [911, 768, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [460, 1184, 0, 33, 33, 0, 0, 1, 0.515152, 0.484848, 1, 0, []],
                17,
                [
                ],
                [
                [
                    222,
                    0,
                    0,
                    0,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [148, 1267, 0, 128, 128, 0, 0, 1, 0, 0.5, 1, 0, []],
                19,
                [
                ],
                [
                ],
                [
                    22,
                    355,
                    1,
                    111,
                    10,
                    100,
                    0,
                    11,
                    11,
                    11,
                    0,
                    0,
                    -111,
                    0,
                    11,
                    800,
                    11,
                    0,
                    2
                ]
            ]
,           [
                [256, 1088, 0, 144, 124, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                24,
                [
                ],
                [
                [
                    1,
                    0,
                    0.1,
                    1,
                    1
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [112, 736, 0, 32, 32, 0, 0, 1, 0.5, 1, 0, 0, []],
                30,
                [
                    0
                ],
                [
                [
                    330,
                    1500,
                    1500,
                    650,
                    1500,
                    1000,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [112, 736, 0, 16, 16, 0, 0, 1, 0.5, 1, 0, 0, []],
                31,
                [
                ],
                [
                [
                    1,
                    0,
                    0,
                    3,
                    1
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [144, 624, 0, 128, 128, 0, 0, 1, 0, 0.5, 1, 0, []],
                37,
                [
                ],
                [
                ],
                [
                    11,
                    360,
                    1,
                    40,
                    9,
                    100,
                    0,
                    10,
                    1,
                    22,
                    0,
                    0,
                    -15,
                    0,
                    55,
                    800,
                    15,
                    0,
                    2
                ]
            ]
            ],
            [           ]
        ]
,       [
            "UI",
            6,
            true,
            [255, 255, 255],
            true,
            0,
            0,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [0, 0, 0, 65.7586, 32, 0, 0, 1, 0, 0, 0, 0, []],
                6,
                [
                ],
                [
                ],
                [
                    "level",
                    0,
                    "16pt Arial",
                    "rgb(255,0,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [896, 768, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 0, 0, 65.7586, 32, 0, 0, 1, 0, 0, 0, 0, []],
                26,
                [
                ],
                [
                ],
                [
                    "chipy",
                    0,
                    "16pt Arial",
                    "rgb(255,255,0)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [256, 0, 0, 65.7586, 32, 0, 0, 1, 0, 0, 0, 0, []],
                27,
                [
                ],
                [
                ],
                [
                    "zycia",
                    0,
                    "16pt Arial",
                    "rgb(0,255,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
        ],
        [
        ],
        []
    ]
,   [
        "L2",
        2222,
        1024,
        false,
        "Event sheet 1",
        [
        [
            "Background",
            0,
            true,
            [0, 0, 153],
            false,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            ],
            [           ]
        ]
,       [
            "Layer 0",
            1,
            true,
            [255, 255, 255],
            true,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [0, 0, 0, 2240, 1024, 0, 0, 1, 0, 0, 1, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 1",
            2,
            true,
            [255, 255, 255],
            true,
            0.4,
            0.4,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [796.636, 83.6364, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1210, 282, 0, 787, 191, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 2",
            3,
            true,
            [255, 255, 255],
            true,
            0.6,
            0.6,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [788, 663, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1280, 1024, 0, 48, 20, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 3",
            4,
            true,
            [255, 255, 255],
            true,
            0.8,
            0.8,
            1,
            false,
            1,
            0,
            0,
            [
            ],
            [           ]
        ]
,       [
            "Game",
            5,
            true,
            [255, 255, 255],
            true,
            1,
            1,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [118, 533, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                1,
                [
                    0,
                    0
                ],
                [
                [
                    330,
                    1500,
                    1500,
                    650,
                    1500,
                    1000,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [64, 768, 0, 478, 257, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [864, 800, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1088, 736, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [992, 928, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1700, 847, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 624, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 528, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624.159, 432.067, 0, 372.035, 32, 0, 0.174533, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1216, 256, 0, 320, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [346, 339, 0, 219, 32, 0, 0.453596, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 224, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 336, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [320, 160, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [512, 128, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [755, 180, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2043, 272, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [928, 288, 0, 96, 16, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 720, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 608, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 512, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [944, 464, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [832, 448, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [736, 432, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624, 416, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2122, 227, 0, 54, 70, 0, 0, 1, 1.05556, 0.342857, 0, 0, []],
                14,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2105, 219, 0, 42, 16, 0, 0, 1, 0.783333, -0.777778, 1, 0, []],
                15,
                [
                ],
                [
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    22,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2086, 269, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -99,
                    0,
                    800,
                    0,
                    0,
                    2
                ]
            ]
,           [
                [2108, 269, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -111,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [911, 768, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [76, 1095, 0, 33, 33, 0, 0, 1, 0.515152, 0.484848, 1, 0, []],
                17,
                [
                ],
                [
                [
                    222,
                    0,
                    0,
                    0,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [-150, 996, 0, 128, 128, 0, 0, 1, 0, 0.5, 1, 0, []],
                19,
                [
                ],
                [
                ],
                [
                    22,
                    355,
                    1,
                    111,
                    10,
                    100,
                    0,
                    11,
                    11,
                    11,
                    0,
                    0,
                    -111,
                    0,
                    11,
                    800,
                    11,
                    0,
                    2
                ]
            ]
,           [
                [1677, 460, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 608, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 736, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 480, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1472, 288, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 384, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1920, -128, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [231, 305, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1720, 428, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [109.803, 515.358, 0, 128, 128, 0, 0, 1, 0, 0.5, 0, 0, []],
                21,
                [
                ],
                [
                ],
                [
                    22,
                    360,
                    1,
                    333,
                    11,
                    100,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    -150,
                    0,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [215, 201, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [363, 141, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [572, 108, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [806, 159, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [383, 327, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1008, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1040, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1072, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1104, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1008, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1040, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1072, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1104, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "UI",
            6,
            true,
            [255, 255, 255],
            true,
            0,
            0,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [0, 0, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                6,
                [
                ],
                [
                ],
                [
                    "Arrow keys or WASD to move",
                    0,
                    "16pt Arial",
                    "rgb(255,0,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [876, 778, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, -1, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                26,
                [
                ],
                [
                ],
                [
                    "Text",
                    0,
                    "16pt Arial",
                    "rgb(255,255,0)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [256, 0, 0, 200, 30, 0, 0, 1, 0, 0, 0, 0, []],
                27,
                [
                ],
                [
                ],
                [
                    "zycia",
                    0,
                    "16pt Arial",
                    "rgb(0,255,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
        ],
        [
        ],
        []
    ]
,   [
        "L3",
        2500,
        1222,
        false,
        "Event sheet 1",
        [
        [
            "Background",
            0,
            true,
            [0, 0, 153],
            false,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [2560, 320, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 0",
            1,
            true,
            [255, 255, 255],
            true,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [0, -8, 0, 2496, 1240, 0, 0, 1, 0, 0, 1, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 1",
            2,
            true,
            [255, 255, 255],
            true,
            0.4,
            0.4,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [796.636, 83.6364, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1211.5, 282, 0, 784, 64, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1208, 720, 0, 784, 64, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 2",
            3,
            true,
            [255, 255, 255],
            true,
            0.6,
            0.6,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [222, 276, 0, 64, 728, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 3",
            4,
            true,
            [255, 255, 255],
            true,
            0.8,
            0.8,
            1,
            false,
            1,
            0,
            0,
            [
            ],
            [           ]
        ]
,       [
            "Game",
            5,
            true,
            [255, 255, 255],
            true,
            1,
            1,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [118, 533, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                1,
                [
                    0,
                    0
                ],
                [
                [
                    330,
                    1500,
                    1500,
                    650,
                    1500,
                    1000,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [64, 768.5, 0, 512, 64, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [864, 800, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1088, 736, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [992, 928, 0, 480, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1700, 847, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 624, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 528, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624.159, 432.067, 0, 372.035, 32, 0, 0.174533, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1216, 256, 0, 320, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [346, 339, 0, 219, 32, 0, 0.453596, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 224, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 336, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [320, 160, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [512, 128, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [755, 180, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2043, 272, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [928, 288, 0, 96, 16, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 720, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 608, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 512, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [944, 464, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [832, 448, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [736, 432, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624, 416, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1544, 224, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [40, 1280, 0, 33, 33, 0, 0, 1, 0.515152, 0.484848, 1, 0, []],
                17,
                [
                ],
                [
                [
                    222,
                    0,
                    0,
                    0,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [-150, 996, 0, 128, 128, 0, 0, 1, 0, 0.5, 1, 0, []],
                19,
                [
                ],
                [
                ],
                [
                    22,
                    355,
                    1,
                    111,
                    10,
                    100,
                    0,
                    11,
                    11,
                    11,
                    0,
                    0,
                    -111,
                    0,
                    11,
                    800,
                    11,
                    0,
                    2
                ]
            ]
,           [
                [1677, 460, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 608, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 736, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 480, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1472, 288, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 384, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1920, -128, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [880, 144, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1720, 428, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [109.803, 515.358, 0, 128, 128, 0, 0, 1, 0, 0.5, 0, 0, []],
                21,
                [
                ],
                [
                ],
                [
                    22,
                    360,
                    1,
                    333,
                    11,
                    100,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    -150,
                    0,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [215, 201, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [363, 141, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [572, 108, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [806, 159, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [383, 327, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1008, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1040, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1072, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1104, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1008, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1040, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1072, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1104, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [448, 760, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [208, 328, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [912, 792, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [704, 664, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [744, 688, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [664, 688, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1456, 896, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1472, 1000, 0, 512, 536, 0, 0, 1, 0, 0, 0, 0, []],
                22,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1984, 864, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2232, 208, 0, 32, 1016, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2264, 1184, 0, 200, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2448, 1136, 0, 54, 70, 0, 0, 1, 1.05556, 0.342857, 0, 0, []],
                14,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2432, 1128, 0, 42, 16, 0, 0, 1, 0.783333, -0.777778, 1, 0, []],
                15,
                [
                ],
                [
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    22,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2408, 1184, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -99,
                    0,
                    800,
                    0,
                    0,
                    2
                ]
            ]
,           [
                [2432, 1184, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -111,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [2312, 600, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2312, 728, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2312, 472, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2312, 376, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2320, 920, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1536, 1048, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1632, 1040, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1728, 1056, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1832, 1048, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1936, 1048, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [528, 760, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [368, 760, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [0, 1144, 0, 640, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [64, 832, 0, 64, 224, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [512, 832, 0, 64, 224, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 1024, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [384, 1024, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [224, 896, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [240, 872, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [272, 872, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [304, 872, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [336, 872, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [432, 1008, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [464, 1008, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [496, 1008, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [496, 976, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [464, 976, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [432, 976, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [432, 944, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [464, 944, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [496, 944, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [496, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [464, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [432, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [432, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [464, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [496, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [496, 848, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [464, 848, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [432, 848, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [144, 1008, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [176, 1008, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [208, 1008, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [208, 976, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [176, 976, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [144, 976, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [144, 944, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 832, 0, 384, 224, 0, 0, 1, 0, 0, 0, 0, []],
                25,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [576, 1144, 0, 32, 32, 0, 0, 1, 0.5, 1, 0, 0, []],
                32,
                [
                ],
                [
                [
                    1,
                    4,
                    0,
                    1,
                    0,
                    0,
                    0,
                    6,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1176, 920, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [552, 1288, 0, 40, 88, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                35,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [744, 1296, 0, 40, 88, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                36,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "UI",
            6,
            true,
            [255, 255, 255],
            true,
            0,
            0,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [8, 8, 0, 64, 32, 0, 0, 1, 0, 0, 0, 0, []],
                6,
                [
                ],
                [
                ],
                [
                    "level",
                    0,
                    "16pt Arial",
                    "rgb(255,0,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [1520, 240, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [848, 152, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1448, 912, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 7, 0, 136, 32, 0, 0, 1, 0, 0, 0, 0, []],
                26,
                [
                ],
                [
                ],
                [
                    "Text",
                    0,
                    "16pt Arial",
                    "rgb(255,255,0)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [256, 8, 0, 200, 30, 0, 0, 1, 0, 0, 0, 0, []],
                27,
                [
                ],
                [
                ],
                [
                    "Text",
                    0,
                    "16pt Arial",
                    "rgb(0,255,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
        ],
        [
        ],
        []
    ]
,   [
        "L4",
        3333,
        1222,
        false,
        "Event sheet 1",
        [
        [
            "Background",
            0,
            true,
            [0, 0, 153],
            false,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [2496, 1736, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [0, 0, 0, 3360, 1240, 0, 0, 1, 0, 0, 1, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 0",
            1,
            true,
            [255, 255, 255],
            true,
            0.2,
            0.2,
            1,
            false,
            1,
            0,
            0,
            [
            ],
            [           ]
        ]
,       [
            "Layer 1",
            2,
            true,
            [255, 255, 255],
            true,
            0.4,
            0.4,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [796.636, 83.6364, 0, 196, 908, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1211.5, 282, 0, 784, 64, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1208, 720, 0, 784, 64, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 2",
            3,
            true,
            [255, 255, 255],
            true,
            0.6,
            0.6,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [222, 276, 0, 64, 728, 0, 0, 1, 0, 0, 0, 0, []],
                0,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "Layer 3",
            4,
            true,
            [255, 255, 255],
            true,
            0.8,
            0.8,
            1,
            false,
            1,
            0,
            0,
            [
            ],
            [           ]
        ]
,       [
            "Game",
            5,
            true,
            [255, 255, 255],
            true,
            1,
            1,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [118, 533, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                1,
                [
                    0,
                    0
                ],
                [
                [
                    330,
                    1500,
                    1500,
                    650,
                    1500,
                    1000,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [64, 768.5, 0, 512, 64, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [864, 800, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1088, 736, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [992, 928, 0, 480, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1700, 847, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 624, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1056, 528, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624.159, 432.067, 0, 372.035, 32, 0, 0.174533, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1216, 256, 0, 320, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [346, 339, 0, 219, 32, 0, 0.453596, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 224, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [160, 336, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [320, 160, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [512, 128, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [755, 180, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2043, 272, 0, 96, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [928, 288, 0, 96, 16, 0, 0, 1, 0, 0, 0, 0, []],
                3,
                [
                ],
                [
                [
                ],
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    50,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 720, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 608, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1120, 512, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [944, 464, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [832, 448, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [736, 432, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [624, 416, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1544, 224, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [40, 1280, 0, 33, 33, 0, 0, 1, 0.515152, 0.484848, 1, 0, []],
                17,
                [
                ],
                [
                [
                    222,
                    0,
                    0,
                    0,
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [-150, 996, 0, 128, 128, 0, 0, 1, 0, 0.5, 1, 0, []],
                19,
                [
                ],
                [
                ],
                [
                    22,
                    355,
                    1,
                    111,
                    10,
                    100,
                    0,
                    11,
                    11,
                    11,
                    0,
                    0,
                    -111,
                    0,
                    11,
                    800,
                    11,
                    0,
                    2
                ]
            ]
,           [
                [1677, 460, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 608, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 736, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 480, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1472, 288, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2048, 384, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1920, -128, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [880, 144, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1720, 428, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [109.803, 515.358, 0, 128, 128, 0, 0, 1, 0, 0.5, 0, 0, []],
                21,
                [
                ],
                [
                ],
                [
                    22,
                    360,
                    1,
                    333,
                    11,
                    100,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    -150,
                    0,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [215, 201, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [363, 141, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [572, 108, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [806, 159, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [383, 327, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1008, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1040, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1072, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1104, 912, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1008, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1040, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1072, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1104, 880, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [448, 760, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [208, 328, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [912, 792, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [704, 664, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [744, 688, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [664, 688, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                12,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1480, 896, 0, 44, 42, 0, 0, 1, 0.5, 0.190476, 1, 0, []],
                13,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1472, 1000, 0, 512, 536, 0, 0, 1, 0, 0, 0, 0, []],
                22,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1984, 864, 0, 32, 736, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2232, 208, 0, 32, 1016, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2264, 1184, 0, 200, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2448, 1136, 0, 54, 70, 0, 0, 1, 1.05556, 0.342857, 0, 0, []],
                14,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2432, 1128, 0, 42, 16, 0, 0, 1, 0.783333, -0.777778, 1, 0, []],
                15,
                [
                ],
                [
                [
                    1,
                    1,
                    0,
                    4,
                    0,
                    0,
                    0,
                    22,
                    0
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2408, 1184, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -99,
                    0,
                    800,
                    0,
                    0,
                    2
                ]
            ]
,           [
                [2432, 1184, 0, 128, 128, 0, -1.57328, 1, 0, 0.5, 1, 0, []],
                16,
                [
                ],
                [
                ],
                [
                    6,
                    55,
                    0,
                    55,
                    11,
                    100,
                    0,
                    11,
                    11,
                    10,
                    1,
                    1,
                    0,
                    -111,
                    0,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [2312, 600, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2312, 728, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2312, 472, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2312, 376, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2320, 920, 0, 160, 16, 0, 0, 0.8, 0, 0, 0, 0, []],
                4,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1536, 1048, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1632, 1040, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1728, 1056, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1832, 1048, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [1936, 1048, 0, 128, 128, 0, -1.54402, 1, 0, 0.5, 0, 0, []],
                23,
                [
                ],
                [
                ],
                [
                    2,
                    60,
                    0,
                    99,
                    22,
                    100,
                    1,
                    1,
                    1,
                    1,
                    1,
                    1,
                    0,
                    -111,
                    1,
                    800,
                    11,
                    0,
                    1
                ]
            ]
,           [
                [528, 760, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [368, 760, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [32, 1152, 0, 544, 64, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [64, 832, 0, 64, 224, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [512, 832, 0, 64, 224, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 1024, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [384, 1024, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [224, 896, 0, 128, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [328, 752, 0, 32, 32, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                33,
                [
                ],
                [
                [
                    1
                ],
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1176, 920, 0, 32, 16, 0, 0, 1, 0.5, 0.2, 0, 0, []],
                20,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [328, 752, 0, 128, 128, 0, 0, 1, 0, 0.5, 0, 0, []],
                34,
                [
                ],
                [
                ],
                [
                    22,
                    360,
                    1,
                    99,
                    16,
                    100,
                    6,
                    6,
                    6,
                    6,
                    6,
                    6,
                    -150,
                    -555,
                    22,
                    800,
                    0,
                    0,
                    1
                ]
            ]
,           [
                [1328, 1120, 0, 32, 64, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                35,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 832, 0, 384, 224, 0, 0, 1, 0, 0, 0, 0, []],
                25,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2656, 1136, 0, 32, 64, 0, 0, 1, 0.5, 0.5, 0, 0, []],
                36,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2608, 208, 0, 32, 1016, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [2640, 1168, 0, 736, 64, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [3312, -200, 0, 32, 1368, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1440, 960, 0, 32, 440, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1088, 1152, 0, 352, 64, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
,       [
            "UI",
            6,
            true,
            [255, 255, 255],
            true,
            0,
            0,
            1,
            false,
            1,
            0,
            0,
            [
            [
                [0, 0, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                6,
                [
                ],
                [
                ],
                [
                    "Arrow keys or WASD to move",
                    0,
                    "16pt Arial",
                    "rgb(255,0,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [1520, 240, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [848, 152, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [1456, 912, 0, 21, 21, 0, 0, 0.88, 0.333333, 0.238095, 0, 0, []],
                18,
                [
                ],
                [
                ],
                [
                    0,
                    0
                ]
            ]
,           [
                [128, 0, 0, 200, 30, 0, 0, 1, 0, 0, 0, 0, []],
                26,
                [
                ],
                [
                ],
                [
                    "Text",
                    0,
                    "16pt Arial",
                    "rgb(255,255,0)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [256, 0, 0, 200, 30, 0, 0, 1, 0, 0, 0, 0, []],
                27,
                [
                ],
                [
                ],
                [
                    "Text",
                    0,
                    "16pt Arial",
                    "rgb(0,255,255)",
                    0,
                    0,
                    0,
                    0,
                    0
                ]
            ]
,           [
                [768, 1152, 0, 96, 32, 0, 0, 1, 0, 0, 0, 0, []],
                2,
                [
                ],
                [
                [
                ]
                ],
                [
                    0,
                    0
                ]
            ]
            ],
            [           ]
        ]
        ],
        [
        ],
        []
    ]
    ],
    [
    [
        "Event sheet 1",
        [
        [
            1,
            "Poziom",
            0,
            1,
false,false
        ]
,       [
            1,
            "chipy",
            0,
            0,
false,false
        ]
,       [
            1,
            "sensibility",
            0,
            0,
false,false
        ]
,       [
            1,
            "baseSensibility",
            0,
            0,
false,false
        ]
,       [
            1,
            "zycia",
            0,
            5,
false,false
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.EveryTick,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                6,
                cr.plugins_.Text.prototype.acts.SetText,
                null
                ,[
                [
                    7,
                    [
                        23,
                        "Poziom"
                    ]
                ]
                ]
            ]
,           [
                26,
                cr.plugins_.Text.prototype.acts.SetText,
                null
                ,[
                [
                    7,
                    [
                        23,
                        "chipy"
                    ]
                ]
                ]
            ]
,           [
                27,
                cr.plugins_.Text.prototype.acts.SetText,
                null
                ,[
                [
                    7,
                    [
                        23,
                        "zycia"
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                5,
                cr.plugins_.Keyboard.prototype.cnds.OnKey,
                null,
                1,
                false,
                false,
                false
                ,[
                [
                    9,
                    40
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.behaviors.Platform.prototype.acts.FallThrough,
                "Platform"
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                5,
                cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    9,
                    87
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.TriggerOnce,
                null,
                0,
                false,
                false,
                false
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.cnds.IsOnFloor,
                "Platform",
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                1,
                cr.behaviors.Platform.prototype.acts.SimulateControl,
                "Platform"
                ,[
                [
                    3,
                    2
                ]
                ]
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["jumping",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                5,
                cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    9,
                    83
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.behaviors.Platform.prototype.acts.FallThrough,
                "Platform"
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.CompareY,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    8,
                    4
                ]
,               [
                    0,
                    [
                        19,
                        cr.system_object.prototype.exps.layoutheight
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    8,
                    4
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ],
            [
            [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["game-fail",true]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SubVar,
                null
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.RestartLayout,
                null
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    12
                ]
                ]
            ]
            ],
            [
            [
                12,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["coin-object",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.AddVar,
                null
                ,[
                [
                    11,
                    "chipy"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.CompareInstanceVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    10,
                    0
                ]
,               [
                    8,
                    4
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.plugins_.Sprite.prototype.acts.SetWidth,
                null
                ,[
                [
                    0,
                    [
                        19,
                        cr.system_object.prototype.exps.lerp
                        ,[
[
                            20,
                            1,
                            cr.plugins_.Sprite.prototype.exps.Width,
                            false,
                            null
                        ]
,[
                            0,
                            0
                        ]
,[
                            1,
                            0.05
                        ]
                        ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.CompareInstanceVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    10,
                    0
                ]
,               [
                    8,
                    4
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.TriggerOnce,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["teleport2",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        "teleport"
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    15
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        55
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.acts.SetEnabled,
                "Platform"
                ,[
                [
                    3,
                    0
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.OnLayoutStart,
                null,
                1,
                false,
                false,
                false
            ]
            ],
            [
            [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["teleport",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.acts.SetEnabled,
                "Platform"
                ,[
                [
                    3,
                    1
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "Poziom"
                ]
,               [
                    8,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    4,
                    14
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.cnds.CompareWidth,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    8,
                    3
                ]
,               [
                    0,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.TriggerOnce,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        0.1
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.SetWidth,
                null
                ,[
                [
                    0,
                    [
                        0,
                        32
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.AddVar,
                null
                ,[
                [
                    11,
                    "Poziom"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.GoToLayout,
                null
                ,[
                [
                    6,
                    "L2"
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    4,
                    14
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "Poziom"
                ]
,               [
                    8,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        2
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.cnds.CompareWidth,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    8,
                    3
                ]
,               [
                    0,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.TriggerOnce,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        0.1
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.SetWidth,
                null
                ,[
                [
                    0,
                    [
                        0,
                        32
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.AddVar,
                null
                ,[
                [
                    11,
                    "Poziom"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.GoToLayout,
                null
                ,[
                [
                    6,
                    "L3"
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "Poziom"
                ]
,               [
                    8,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        3
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    4,
                    14
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.cnds.CompareWidth,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    8,
                    3
                ]
,               [
                    0,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.TriggerOnce,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        0.1
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.SetWidth,
                null
                ,[
                [
                    0,
                    [
                        0,
                        32
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.AddVar,
                null
                ,[
                [
                    11,
                    "Poziom"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.GoToLayout,
                null
                ,[
                [
                    6,
                    "L3"
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
                null
                ,[
                [
                    10,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                13,
                cr.plugins_.Sprite.prototype.cnds.IsOnScreen,
                null,
                0,
                false,
                false,
                false
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.Every,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    0,
                    [
                        0,
                        2
                    ]
                ]
                ]
            ]
,           [
                13,
                cr.plugins_.Sprite.prototype.cnds.IsMirrored,
                null,
                0,
                false,
                true,
                false
            ]
            ],
            [
            [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["shoot",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                13,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    17
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                13,
                cr.plugins_.Sprite.prototype.cnds.IsOnScreen,
                null,
                0,
                false,
                false,
                false
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.Every,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    0,
                    [
                        0,
                        2
                    ]
                ]
                ]
            ]
,           [
                13,
                cr.plugins_.Sprite.prototype.cnds.IsMirrored,
                null,
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["shoot",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                13,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    17
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                17,
                cr.plugins_.Sprite.prototype.acts.SetAngle,
                null
                ,[
                [
                    0,
                    [
                        0,
                        180
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                18,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    13
                ]
                ]
            ]
            ],
            [
            [
                13,
                cr.plugins_.Sprite.prototype.acts.SetMirrored,
                null
                ,[
                [
                    3,
                    0
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    13
                ]
                ]
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.cnds.IsFalling,
                "Platform",
                0,
                false,
                false,
                false
            ]
            ],
            [
            [
                13,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                13,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    19
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.acts.SimulateControl,
                "Platform"
                ,[
                [
                    3,
                    2
                ]
                ]
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["164855__dayofdagon__bit-bomber2",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.AddVar,
                null
                ,[
                [
                    11,
                    "chipy"
                ]
,               [
                    7,
                    [
                        0,
                        5
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                17,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    1
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    8,
                    4
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ],
            [
            [
                17,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["8-bit-explosion1",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    21
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                17,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    19
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                17,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SubVar,
                null
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.RestartLayout,
                null
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    20
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    8,
                    4
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
            ],
            [
            [
                20,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    24
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                20,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    19
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["164854__dayofdagon__bit-bomber3",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                20,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                1,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    21
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        0,
                        2
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.SubVar,
                null
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.RestartLayout,
                null
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                24,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    20
                ]
                ]
            ]
            ],
            [
            [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        0.4
                    ]
                ]
                ]
            ]
,           [
                20,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    24
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                20,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    19
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["164854__dayofdagon__bit-bomber3",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
,           [
                20,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    4,
                    25
                ]
                ]
            ]
            ],
            [
            [
                25,
                cr.plugins_.TiledBg.prototype.acts.SetOpacity,
                null
                ,[
                [
                    0,
                    [
                        0,
                        44
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                null,
                0,
                false,
                true,
                false
                ,[
                [
                    4,
                    25
                ]
                ]
            ]
            ],
            [
            [
                25,
                cr.plugins_.TiledBg.prototype.acts.SetOpacity,
                null
                ,[
                [
                    0,
                    [
                        0,
                        99
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.CompareVar,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    11,
                    "chipy"
                ]
,               [
                    8,
                    0
                ]
,               [
                    7,
                    [
                        0,
                        100
                    ]
                ]
                ]
            ]
            ],
            [
            [
                -1,
                cr.system_object.prototype.acts.SetVar,
                null
                ,[
                [
                    11,
                    "chipy"
                ]
,               [
                    7,
                    [
                        0,
                        0
                    ]
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.AddVar,
                null
                ,[
                [
                    11,
                    "zycia"
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
,           [
                11,
                cr.plugins_.Audio.prototype.acts.Play,
                null
                ,[
                [
                    2,
                    ["energy-1",false]
                ]
,               [
                    3,
                    0
                ]
,               [
                    0,
                    [
                        0,
                        0
                    ]
                ]
,               [
                    1,
                    [
                        2,
                        ""
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            [true, "dog"],
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.IsGroupActive,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    1,
                    [
                        2,
                        "dog"
                    ]
                ]
                ]
            ]
            ],
            [
            ]
            ,[
            [
                0,
                null,
                false,
                [
                [
                    -1,
                    cr.system_object.prototype.cnds.OnLayoutStart,
                    null,
                    1,
                    false,
                    false,
                    false
                ]
                ],
                [
                [
                    31,
                    cr.plugins_.Sprite.prototype.acts.Destroy,
                    null
                ]
,               [
                    -1,
                    cr.system_object.prototype.acts.SetVar,
                    null
                    ,[
                    [
                        11,
                        "baseSensibility"
                    ]
,                   [
                        7,
                        [
                            4,
                            [
                                20,
                                1,
                                cr.plugins_.Sprite.prototype.exps.Width,
                                false,
                                null
                            ]
                            ,[
                                20,
                                30,
                                cr.plugins_.Sprite.prototype.exps.Width,
                                false,
                                null
                            ]
                        ]
                    ]
                    ]
                ]
,               [
                    -1,
                    cr.system_object.prototype.acts.SetVar,
                    null
                    ,[
                    [
                        11,
                        "sensibility"
                    ]
,                   [
                        7,
                        [
                            23,
                            "baseSensibility"
                        ]
                    ]
                    ]
                ]
                ]
            ]
,           [
                0,
                null,
                false,
                [
                [
                    -1,
                    cr.system_object.prototype.cnds.Compare,
                    null,
                    0,
                    false,
                    false,
                    false
                    ,[
                    [
                        7,
                        [
                            19,
                            cr.system_object.prototype.exps.distance
                            ,[
[
                                20,
                                30,
                                cr.plugins_.Sprite.prototype.exps.X,
                                false,
                                null
                            ]
,[
                                20,
                                30,
                                cr.plugins_.Sprite.prototype.exps.Y,
                                false,
                                null
                            ]
,[
                                20,
                                1,
                                cr.plugins_.Sprite.prototype.exps.X,
                                false,
                                null
                            ]
,[
                                20,
                                1,
                                cr.plugins_.Sprite.prototype.exps.Y,
                                false,
                                null
                            ]
                            ]
                        ]
                    ]
,                   [
                        8,
                        4
                    ]
,                   [
                        7,
                        [
                            23,
                            "sensibility"
                        ]
                    ]
                    ]
                ]
                ],
                [
                ]
                ,[
                [
                    0,
                    null,
                    false,
                    [
                    [
                        30,
                        cr.plugins_.Sprite.prototype.cnds.CompareX,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            8,
                            2
                        ]
,                       [
                            0,
                            [
                                20,
                                1,
                                cr.plugins_.Sprite.prototype.exps.X,
                                false,
                                null
                            ]
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        30,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            1
                        ]
                        ]
                    ]
                    ]
                ]
,               [
                    0,
                    null,
                    false,
                    [
                    [
                        30,
                        cr.plugins_.Sprite.prototype.cnds.CompareX,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            8,
                            4
                        ]
,                       [
                            0,
                            [
                                20,
                                1,
                                cr.plugins_.Sprite.prototype.exps.X,
                                false,
                                null
                            ]
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        30,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            0
                        ]
                        ]
                    ]
                    ]
                ]
,               [
                    0,
                    null,
                    false,
                    [
                    [
                        30,
                        cr.behaviors.Platform.prototype.cnds.IsOnFloor,
                        "Platform",
                        0,
                        false,
                        false,
                        false
                    ]
,                   [
                        30,
                        cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            4,
                            31
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        30,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            2
                        ]
                        ]
                    ]
,                   [
                        31,
                        cr.plugins_.Sprite.prototype.acts.Destroy,
                        null
                    ]
                    ]
                ]
                ]
            ]
,           [
                0,
                null,
                false,
                [
                [
                    1,
                    cr.behaviors.Platform.prototype.cnds.OnJump,
                    "Platform",
                    1,
                    false,
                    false,
                    false
                ]
                ],
                [
                [
                    1,
                    cr.plugins_.Sprite.prototype.acts.Spawn,
                    null
                    ,[
                    [
                        4,
                        31
                    ]
,                   [
                        5,
                        [
                            0,
                            5
                        ]
                    ]
,                   [
                        7,
                        [
                            0,
                            0
                        ]
                    ]
                    ]
                ]
,               [
                    -1,
                    cr.system_object.prototype.acts.SetVar,
                    null
                    ,[
                    [
                        11,
                        "sensibility"
                    ]
,                   [
                        7,
                        [
                            0,
                            0
                        ]
                    ]
                    ]
                ]
                ]
            ]
,           [
                0,
                null,
                false,
                [
                [
                    -1,
                    cr.system_object.prototype.cnds.EveryTick,
                    null,
                    0,
                    false,
                    false,
                    false
                ]
                ],
                [
                [
                    -1,
                    cr.system_object.prototype.acts.SetVar,
                    null
                    ,[
                    [
                        11,
                        "sensibility"
                    ]
,                   [
                        7,
                        [
                            19,
                            cr.system_object.prototype.exps.min
                            ,[
[
                                23,
                                "baseSensibility"
                            ]
,[
                                4,
                                [
                                    23,
                                    "sensibility"
                                ]
                                ,[
                                    6,
                                    [
                                        6,
                                        [
                                            23,
                                            "baseSensibility"
                                        ]
                                        ,[
                                            0,
                                            2
                                        ]
                                    ]
                                    ,[
                                        19,
                                        cr.system_object.prototype.exps.dt
                                    ]
                                ]
                            ]
                            ]
                        ]
                    ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            [true, "flip"],
            false,
            [
            [
                -1,
                cr.system_object.prototype.cnds.IsGroupActive,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    1,
                    [
                        2,
                        "flip"
                    ]
                ]
                ]
            ]
            ],
            [
            ]
            ,[
            [
                0,
                null,
                false,
                [
                [
                    5,
                    cr.plugins_.Keyboard.prototype.cnds.OnKey,
                    null,
                    1,
                    false,
                    false,
                    false
                    ,[
                    [
                        9,
                        32
                    ]
                    ]
                ]
                ],
                [
                [
                    1,
                    cr.plugins_.Sprite.prototype.acts.ToggleBoolInstanceVar,
                    null
                    ,[
                    [
                        10,
                        1
                    ]
                    ]
                ]
                ]
            ]
,           [
                0,
                null,
                false,
                [
                [
                    1,
                    cr.plugins_.Sprite.prototype.cnds.IsBoolInstanceVarSet,
                    null,
                    0,
                    false,
                    true,
                    false
                    ,[
                    [
                        10,
                        1
                    ]
                    ]
                ]
                ],
                [
                [
                    1,
                    cr.behaviors.Platform.prototype.acts.SetGravityAngle,
                    "Platform"
                    ,[
                    [
                        0,
                        [
                            0,
                            90
                        ]
                    ]
                    ]
                ]
,               [
                    1,
                    cr.plugins_.Sprite.prototype.acts.SetFlipped,
                    null
                    ,[
                    [
                        3,
                        1
                    ]
                    ]
                ]
                ]
                ,[
                [
                    0,
                    null,
                    false,
                    [
                    [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            9,
                            65
                        ]
                        ]
                    ]
,                   [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        true,
                        false
                        ,[
                        [
                            9,
                            39
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        1,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            0
                        ]
                        ]
                    ]
,                   [
                        1,
                        cr.plugins_.Sprite.prototype.acts.SetMirrored,
                        null
                        ,[
                        [
                            3,
                            0
                        ]
                        ]
                    ]
,                   [
                        30,
                        cr.plugins_.Sprite.prototype.acts.SetMirrored,
                        null
                        ,[
                        [
                            3,
                            0
                        ]
                        ]
                    ]
                    ]
                ]
,               [
                    0,
                    null,
                    false,
                    [
                    [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            9,
                            68
                        ]
                        ]
                    ]
,                   [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        true,
                        false
                        ,[
                        [
                            9,
                            37
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        1,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            1
                        ]
                        ]
                    ]
,                   [
                        1,
                        cr.plugins_.Sprite.prototype.acts.SetMirrored,
                        null
                        ,[
                        [
                            3,
                            1
                        ]
                        ]
                    ]
,                   [
                        30,
                        cr.plugins_.Sprite.prototype.acts.SetMirrored,
                        null
                        ,[
                        [
                            3,
                            1
                        ]
                        ]
                    ]
                    ]
                ]
                ]
            ]
,           [
                0,
                null,
                false,
                [
                [
                    1,
                    cr.plugins_.Sprite.prototype.cnds.IsBoolInstanceVarSet,
                    null,
                    0,
                    false,
                    false,
                    false
                    ,[
                    [
                        10,
                        1
                    ]
                    ]
                ]
                ],
                [
                [
                    1,
                    cr.behaviors.Platform.prototype.acts.SetGravityAngle,
                    "Platform"
                    ,[
                    [
                        0,
                        [
                            0,
                            270
                        ]
                    ]
                    ]
                ]
,               [
                    1,
                    cr.plugins_.Sprite.prototype.acts.SetFlipped,
                    null
                    ,[
                    [
                        3,
                        0
                    ]
                    ]
                ]
                ]
                ,[
                [
                    0,
                    null,
                    false,
                    [
                    [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            9,
                            65
                        ]
                        ]
                    ]
,                   [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        true,
                        false
                        ,[
                        [
                            9,
                            39
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        1,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            1
                        ]
                        ]
                    ]
,                   [
                        1,
                        cr.plugins_.Sprite.prototype.acts.SetMirrored,
                        null
                        ,[
                        [
                            3,
                            0
                        ]
                        ]
                    ]
                    ]
                ]
,               [
                    0,
                    null,
                    false,
                    [
                    [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        false,
                        false
                        ,[
                        [
                            9,
                            68
                        ]
                        ]
                    ]
,                   [
                        5,
                        cr.plugins_.Keyboard.prototype.cnds.IsKeyDown,
                        null,
                        0,
                        false,
                        true,
                        false
                        ,[
                        [
                            9,
                            37
                        ]
                        ]
                    ]
                    ],
                    [
                    [
                        1,
                        cr.behaviors.Platform.prototype.acts.SimulateControl,
                        "Platform"
                        ,[
                        [
                            3,
                            0
                        ]
                        ]
                    ]
,                   [
                        1,
                        cr.plugins_.Sprite.prototype.acts.SetMirrored,
                        null
                        ,[
                        [
                            3,
                            1
                        ]
                        ]
                    ]
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
                null,
                0,
                false,
                false,
                false
                ,[
                [
                    4,
                    32
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.behaviors.Platform.prototype.acts.SetJumpStrength,
                "Platform"
                ,[
                [
                    0,
                    [
                        0,
                        1111
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.acts.SimulateControl,
                "Platform"
                ,[
                [
                    3,
                    2
                ]
                ]
            ]
,           [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        0.1
                    ]
                ]
                ]
            ]
,           [
                1,
                cr.behaviors.Platform.prototype.acts.SetJumpStrength,
                "Platform"
                ,[
                [
                    0,
                    [
                        0,
                        650
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    35
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        1
                    ]
                ]
                ]
            ]
,           [
                36,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    1
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
            ]
        ]
,       [
            0,
            null,
            false,
            [
            [
                1,
                cr.plugins_.Sprite.prototype.cnds.OnCollision,
                null,
                0,
                false,
                false,
                true
                ,[
                [
                    4,
                    36
                ]
                ]
            ]
            ],
            [
            [
                1,
                cr.plugins_.Sprite.prototype.acts.Destroy,
                null
            ]
,           [
                -1,
                cr.system_object.prototype.acts.Wait,
                null
                ,[
                [
                    0,
                    [
                        1,
                        1
                    ]
                ]
                ]
            ]
,           [
                35,
                cr.plugins_.Sprite.prototype.acts.Spawn,
                null
                ,[
                [
                    4,
                    1
                ]
,               [
                    5,
                    [
                        0,
                        5
                    ]
                ]
,               [
                    7,
                    [
                        0,
                        1
                    ]
                ]
                ]
            ]
            ]
        ]
        ]
    ]
    ],
    "media/",
    false,
    650,
    360,
    3,
    true,
    true,
    true,
    "0.1",
    1,
    false,
    0,
    false
];};