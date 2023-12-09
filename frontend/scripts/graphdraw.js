//this js file was used for Galaxy Project to draw pipeline
//Draw Graph in Canvas

const ObjState = Object.freeze({ "normal": 1, "selected": 2 })
const PinDirection = Object.freeze({ "in": 1, "out": 2 })
const HitState = Object.freeze({ "Hit": 1, "HitPin": 2, "NotHit": 3 })

CanvasRenderingContext2D.prototype.roundRect = function (sx, sy, w, h, r) {
    let ex = sx + w
    let ey = sy + h;
    var r2d = Math.PI / 180;
    if ((ex - sx) - (2 * r) < 0) { r = ((ex - sx) / 2); } //ensure that the radius isn't too large for x
    if ((ey - sy) - (2 * r) < 0) { r = ((ey - sy) / 2); } //ensure that the radius isn't too large for y
    this.beginPath();
    this.moveTo(sx + r, sy);
    this.lineTo(ex - r, sy);
    this.arc(ex - r, sy + r, r, r2d * 270, r2d * 360, false);
    this.lineTo(ex, ey - r);
    this.arc(ex - r, ey - r, r, r2d * 0, r2d * 90, false);
    this.lineTo(sx + r, ey);
    this.arc(sx + r, ey - r, r, r2d * 90, r2d * 180, false);
    this.lineTo(sx, sy + r);
    this.arc(sx + r, sy + r, r, r2d * 180, r2d * 270, false);
    this.closePath();
}


class GraphManager {

    reset() {
        this.objs = [];
        this.selected = [];
        this.instanceMap = {};

        //state
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.mouseIsDown = false;
        this.rightmousebuttonIsDown = false;
        this.ConnectObj = null;

        //scoll
        this.viewportX = 0;
        this.viewportY = 0;
        this.scaleX = 1;
        this.scaleY = 1;

        this.oldViewportX = 0;
        this.oldViewportY = 0;

    }
    reInit(canvas, actMap) {
        var rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        this.site = canvas;
        this.actMap = JSON.parse(actMap);

        this.redraw();
    }
    constructor(canvas, actMap) {
        var rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        this.site = canvas;
        this.actMap = JSON.parse(actMap);

        this.reset();
        this.redraw();

        var self = this;
        function onMouseDown(event) {
            var pos = getMousePos(event);
            var x = pos.x;
            var y = pos.y;

            self.mouseDownX = x;
            self.mouseDownY = y;

            if (event.button == 2) //Right button
            {
                self.oldViewportX = self.viewportX;
                self.oldViewportY = self.viewportY;

                self.rightmousebuttonIsDown = true;
                return;
            }
            let newPos = self.transformPoint(pos);
            x = newPos.x;
            y = newPos.y;

            for (let idx in self.objs) {
                let obj = self.objs[idx];
                obj.onMouseHover(x, y);
            }
            self.hitTest(x, y);
            self.mouseIsDown = true;
            self.redraw();
        }
        function onReSize(event) {
            var canvas = self.site;
            var rect = canvas.parentNode.getBoundingClientRect();
            canvas.width = canvas.clientWidth;//rect.width-300;
            canvas.height = canvas.clientHeight;//rect.height;
            self.redraw();
        }
        function getMousePos(evt) {
            var canvas = self.site;
            var rect = canvas.getBoundingClientRect(), // abs. size of element
                scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
                scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

            return {
                x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
                y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
            }
        }
        function onMouseMove(event) {
            if (!self.mouseIsDown && !self.rightmousebuttonIsDown) {
                return;
            }
            var pos = getMousePos(event);
            var x = pos.x;
            var y = pos.y;
            if (self.rightmousebuttonIsDown) {
                self.viewportX = self.oldViewportX + x - self.mouseDownX;
                self.viewportY = self.oldViewportY + y - self.mouseDownY;
                self.redraw();
                return;
            }
            var offX = x - self.mouseDownX;
            var offY = y - self.mouseDownY;
            offX = self.transformScaleX(offX);
            offY = self.transformScaleX(offY);
            let newPos = self.transformPoint(pos);
            x = newPos.x;
            y = newPos.y;

            for (let idx in self.objs) {
                let obj = self.objs[idx];
                obj.onMouseHover(x, y);
            }
            for (let idx in self.selected) {
                var obj = self.selected[idx];
                obj.move(offX, offY, event.ctrlKey);
            }
            if (event.ctrlKey) {
                if (self.selected.length > 0) {
                    let obj = self.selected[0];
                    let name = obj.constructor.name;
                    if (name == "Activity") {
                        self.calcNodeAttach(obj);
                    }
                }
            }
            self.redraw();
        }
        function onMouseUp(event) {
            var pos = getMousePos(event);
            var x = pos.x;
            var y = pos.y;
            if (event.button == 2) //Right button
            {
                self.rightmousebuttonIsDown = false;
                self.redraw();
                return;
            }
            let newPos = self.transformPoint(pos);
            x = newPos.x;
            y = newPos.y;

            let hit = self.hitTest(x, y);
            if (!hit) {
                self.deselect();
            }
            self.mouseIsDown = false;

            for (let idx in self.objs) {
                let obj = self.objs[idx];
                obj.onMouseLeave(x, y);
            }
            if (self.ConnectObj != null) {
                if (!self.ConnectObj.isCompleted()) {
                    self.removeObj(self.ConnectObj);
                    self.ConnectObj = null;
                }
                self.ConnectObj = null;
            }
            self.recalcNodes();
            self.redraw();

            if (self.selected.length > 0) {
                self.SettingSetForObject(self.selected[0]);
            }
        }
        function onZoom(event) {
            var pos = getMousePos(event);
            var x = pos.x;
            var y = pos.y;

            let delta = event.deltaY * -0.0001;
            let oldScaleX = self.scaleX;
            let oldScaleY = self.scaleY;
            self.scaleX += delta;
            self.scaleY += delta;
            // Restrict scale
            self.scaleX = Math.min(Math.max(.125, self.scaleX), 4);
            self.scaleY = Math.min(Math.max(.125, self.scaleY), 4);

            let newViewPortX = x - (x - self.viewportX) / oldScaleX * self.scaleX;
            let newViewPortY = y - (y - self.viewportY) / oldScaleY * self.scaleY;
            self.viewportX = newViewPortX;
            self.viewportY = newViewPortY;

            self.redraw();
        }
        function onKeyDown(event) {
            let ch = event.key;
            if (ch == 'd' && event.shiftKey) {
                self.deleteCurObj();
            }
        }
        function onInfoChange(event) {
            if (self.selected.length == 0) {
                return;
            }
            let obj = self.selected[0];
            obj.id = idInfo.value;
        }

        this.site.addEventListener('mousemove', onMouseMove, false);
        this.site.addEventListener('mousedown', onMouseDown, false);
        this.site.addEventListener('mouseup', onMouseUp, false);
        this.site.addEventListener('wheel', onZoom, false);
        //window.addEventListener('resize', onReSize);
        //this.site.parentNode.addEventListener('resize', onReSize, false);
        document.addEventListener('keydown', onKeyDown, false);

    }
    SettingSetForObject(obj) {
        let name = obj.constructor.name;
        if (name == "Node") {
            idInfo.style.visibility = "visible";
            idDesc.innerHTML = "Node,ID:";
            idInfo.value = obj.id;
            idSetting.style.visibility = "hidden";
        }
        else if (name == "Activity") {
            idSetting.style.visibility = "visible";
            idInfo.style.visibility = "hidden";
            let actInfo = this.actMap[obj.name];
            if (actInfo != null) {
                idDesc.innerHTML = "Activity:"
                    + obj.name + "(" + actInfo["Desc"] + "),Instance:" + obj.id;
            }
            let jsonSettingStr = "";
            if (obj.setting != null) {
                jsonSettingStr = JSON.stringify(obj.setting, null, '\t');
            }
            idSetting.value = jsonSettingStr;
        }
        else if (name == "Connect") {
            let desc0 = "";
            let desc1 = "";
            if (obj.StartActivity != null) {
                let nodeInfo = "";
                if (obj.StartActivity.node != null) {
                    nodeInfo = "Node:" + obj.StartActivity.node.id + ",";
                }
                desc0 = nodeInfo + obj.StartActivity.name + "." + obj.StartActivity.id;
            }
            if (obj.EndActivity != null) {
                let nodeInfo = "";
                if (obj.EndActivity.node != null) {
                    nodeInfo = "Node:" + obj.EndActivity.node.id + ",";
                }
                desc1 = nodeInfo + obj.EndActivity.name + "." + obj.EndActivity.id;
            }
            idDesc.innerHTML = "Connect from " + desc0 + " to " + desc1;
            idInfo.style.visibility = "hidden";
        }
    }
    transformScaleX(x) {
        return x / this.scaleX;
    }
    transformScaleY(y) {
        return y / this.scaleY;
    }
    transformPoint(pt0) {
        let pt = pt0;
        pt.x -= this.viewportX;
        pt.x /= this.scaleX;
        pt.y -= this.viewportY;
        pt.y /= this.scaleY;
        return pt;
    }
    transformPointBackToCanvasSpace(pt0) {
        let pt = pt0;
        pt.x *= this.scaleX;
        pt.x += this.viewportX;
        pt.y *= this.scaleY;
        pt.y += this.viewportY;
        return pt;
    }
    recalcNodes() {
        for (let i in this.objs) {
            let it = this.objs[i];
            let name = it.constructor.name;
            if (name == "Node") {
                it.recalc();
            }
        }
    }
    calcNodeAttach(obj) {
        let cx = obj.x + obj.w / 2;
        let cy = obj.y + obj.h / 2;
        let node = null;
        for (let i in this.objs) {
            let it = this.objs[i];
            let name = it.constructor.name;
            if (name != "Node") {
                continue;
            }
            let rc = new Rect(it.x, it.y, it.w, it.h);
            if (rc.ptInside(cx, cy)) {
                node = it;
                break;
            }
        }
        if (node == null) {
            //check if this Obj is inside some nodes
            for (let i in this.objs) {
                let it = this.objs[i];
                let name = it.constructor.name;
                if (name != "Node") {
                    continue;
                }
                for (let i in it.activities) {
                    let act = it.activities[i];
                    if (act == obj) {
                        it.remove(act);
                    }
                }
            }
        }
        else {
            let find = false;
            for (let i in node.activities) {
                let act = node.activities[i];
                if (act == obj) {
                    find = true;
                }
            }
            if (!find) {
                node.add(obj);
            }
        }
    }
    deleteConnectObjWithActivity(activity) {
        let delList = [];
        for (let idx in this.objs) {
            let obj = this.objs[idx];
            let name = obj.constructor.name;
            if (name == "Connect") {
                if (obj.StartActivity == activity || obj.EndActivity == activity) {
                    delList.push(obj);
                }
            }
        }
        for (let idx in delList) {
            var obj = delList[idx];
            this.removeObj(obj);
        }
    }
    deleteCurObj() {
        for (let idx in this.selected) {
            var obj = this.selected[idx];
            this.removeObj(obj);
        }
        this.redraw();
    }
    removeObj(objRemove) {
        objRemove.removeDependObjs();
        for (let idx in this.objs) {
            let obj = this.objs[idx];
            if (obj == objRemove) {
                this.objs.splice(idx, 1);
                break;
            }
        }
    }
    setSelectedPin(act, pin, x, y) {
        if (this.ConnectObj == null) {
            let conn = new Connect(this);
            conn.StartActivity = act;
            conn.StartPin = pin;
            conn.x = x;
            conn.y = y;
            conn.keep();
            this.objs.push(conn);
            this.ConnectObj = conn;
            this.deselect();
            this.selected.push(conn);
        }
        else {
            if (this.ConnectObj.StartActivity != act) {
                this.ConnectObj.EndActivity = act;
                this.ConnectObj.EndPin = pin;
            }
        }
        return this.ConnectObj;
    }
    newNode() {
        var obj = new Node(this);
        let pt = new Point(obj.x, obj.y);
        pt = this.transformPoint(pt);
        obj.x = pt.x;
        obj.y = pt.y;

        this.objs.push(obj);
        this.redraw();
    }
    newActivityForLoad(objName, id) {
        let act = new Activity(this);
        let name = objName;
        let actInfo = this.actMap[name];
        if (actInfo == null) {
            return null;
        }
        let pins = actInfo["Pins"];
        this.buildPins(act, pins);
        return act;
    }
    buildPins(act, pins) {
        for (var i = 0; i < pins.length; i++) {
            var pin = pins[i];
            var dir;
            if (pin.Dir == "in") {
                dir = PinDirection.in;
            }
            else if (pin.Dir == "out") {
                dir = PinDirection.out;
            }
            act.addPin(pin.Name, dir);
        }
    }
    newObj(objType, desc, pinStr) {
        var obj = new Activity(this);
        obj.x -= this.viewportX;
        obj.y -= this.viewportY;
        var id = this.instanceMap[objType];
        if (id == null) {
            this.instanceMap[objType] = 0;
            id = 0;
        }
        else {
            this.instanceMap[objType] = ++id;
        }
        obj.id = id;
        obj.name = objType;
        var pins = JSON.parse(pinStr);
        this.buildPins(obj, pins);

        if (obj != null) {
            this.objs.push(obj);
            this.redraw();
        }
    }
    redraw() {
        var canvas = this.site;
        var ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(this.viewportX, this.viewportY);
        ctx.scale(this.scaleX, this.scaleY);
        for (var idx in this.objs) {
            this.objs[idx].render(ctx);
        }
    }
    deselect() {
        //todo: add multiple selected support
        for (var j in this.selected) {
            var selObj = this.selected[j];
            selObj.setState(ObjState.normal);
        }
        if (this.selected.length > 0) {
            this.selected.length = 0;
        }
    }
    hitTest(x, y) {
        let hitObj = null;
        let hitLayer = -1;
        let hit0 = false;
        for (let idx in this.objs) {
            let obj = this.objs[idx];
            let hit = obj.hitTest(x, y);
            if (hit == HitState.HitPin) {
                return false;
            }
            if (hit == HitState.Hit) {
                if (obj.layer >= hitLayer) {
                    hitLayer = obj.layer;
                    hitObj = obj;
                }
            }
        }
        if (hitObj != null) {
            this.deselect();
            this.selected.push(hitObj);
            hitObj.setState(ObjState.selected);
            hit0 = true;
        }
        return hit0;
    }
    save() {
        let jsonObList = [];
        for (let idx in this.objs) {
            let obj = this.objs[idx];
            let jsonObj = obj.save();
            jsonObList.push(jsonObj);
        }
        let graphRoot = { "pipeline": jsonObList };
        let jsonStr = JSON.stringify(graphRoot, null, '\t');
        return jsonStr;
    }
    pipeline_run() {
        alert ("pipeline_run");
        let jsonObList = [];
        let retValues = [];
        for (let idx in this.objs) {
            let obj = this.objs[idx];
            if (obj.constructor.name == "Node") {
                retValues.push(obj.id);
            }
            let jsonObj = obj.save();
            jsonObList.push(jsonObj);
        }
        let graphRoot = { "pipeline": jsonObList };
        let jsonStr = JSON.stringify(graphRoot);
        retValues.push(jsonStr);
        return retValues;
    }

    load(plInfo,jsonStr) {
        const root = JSON.parse(jsonStr);
        if (root == null) {
            return false;
        }
        this.reset();

        let jsonObList = root["pipeline"];
        for (let i in jsonObList) {
            let jsonObj = jsonObList[i];
            let name = jsonObj["name"];
            let id = jsonObj["id"];
            let obj = null;
            switch (name) {
                case "Node":
                    obj = new Node(this);
                    break;
                case "Connect":
                    obj = new Connect(this);
                    break;
                default://Activity
                    obj = this.newActivityForLoad(name, id);
            }
            if (obj != null) {
                //update last ID
                var lastid = this.instanceMap[name];
                if (lastid == null) {
                    this.instanceMap[name] = id;
                }
                else {
                    this.instanceMap[name] = Math.max(id, lastid);
                }

                obj.load(jsonObj);
                this.objs.push(obj);
            }
        }
        for (let i in this.objs) {
            let obj = this.objs[i];
            obj.postLoad();
        }
        /*if (idToolbarInput != null) {
            idToolbarInput.value = plInfo.name;
        }*/
        this.redraw();
        return true;
    }

    findObj(name, id) {
        let retObj = null;
        for (let i in this.objs) {
            let obj = this.objs[i];
            if (obj.name == name && obj.id == id) {
                retObj = obj;
                break;
            }
        }
        return retObj;
    }
    setObjId(id) {
        if (this.selected.length == 0) {
            return;
        }
        let obj = this.selected[0];
        obj.id = id;
        this.redraw();
    }

    setObjSetting(jsonSetting) {
        if (this.selected.length == 0) {
            return;
        }
        let obj = this.selected[0];
        let setObj = null;
        try {
            setObj = JSON.parse(jsonSetting);
        } catch (err) {
        }
        obj.setting = setObj;
    }
    setProperties() {
        if (this.selected.length > 0) {
            this.SettingSetForObject(this.selected[0]);
        }
    }
    CreateNewPipeline() {
        alert ("CreateNewPipeline");
        if (idToolbarInput != null) {
            idToolbarInput.value = "";
        }
        this.reset();
        this.redraw();
    }
}

class DrawObj {
    constructor(mgr) {
        this.id = 0;
        this.name = "";
        this.setting = null;
        this.mgr = mgr;
        this.x = 10;
        this.y = 50;
        this.w = 150;
        this.h = 100;
        this.layer = 0;
        this.state = ObjState.normal;

        //state
        this.oldX = this.x;
        this.oldY = this.y;
    }
    load(jsonObj) {
        let id = jsonObj["id"];
        if (typeof id === 'string' || id instanceof String) {
            id = parseInt(id, 10);
        }
        this.id = id;
        this.name = jsonObj["name"];
        this.x = jsonObj["x"];
        this.y = jsonObj["y"];
        this.w = jsonObj["w"];
        this.h = jsonObj["h"];
        this.setting = jsonObj["settings"];
    }
    postLoad() {

    }
    render(ctx) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let name = this.name;
        if (this.id > 0) {
            name += this.id;
        }
        ctx.fillText(name, this.x + this.w / 2, this.y + this.h / 2);
    }
    keep() {
        this.oldX = this.x;
        this.oldY = this.y;
    }
    hitTest(x, y) {
        if (x >= this.x && x <= (this.x + this.w) &&
            y >= this.y && y <= (this.y + this.h)) {
            this.keep();
            return HitState.Hit;
        }
        else {
            return HitState.NotHit;
        }
    }
    setState(s) {
        this.state = s;
    }
    move(offX, offY, ctrlKeyPressed) {
        this.x = this.oldX + offX;
        this.y = this.oldY + offY;
    }
    onMouseHover(x, y) {

    }
    onMouseLeave(x, y) {

    }
    removeDependObjs() {

    }
    save() {
        let jsonObj = {};
        jsonObj["name"] = this.name;
        jsonObj["id"] = this.id;
        jsonObj["x"] = this.x;
        jsonObj["y"] = this.y;
        jsonObj["w"] = this.w;
        jsonObj["h"] = this.h;
        if (this.setting != null) {
            jsonObj["settings"] = this.setting;
        }
        return jsonObj;
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    ptInside(x, y) {
        if (x >= this.x && x <= (this.x + this.w) &&
            y >= this.y && y <= (this.y + this.h)) {
            return true;
        }
        else {
            return false;
        }
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Pin {
    constructor(activity) {
        this.name = "";
        this.dir = PinDirection.out;
    }
}
class NodePin extends Pin {
    constructor(activity) {
        super(activity);
        this.angle = 0.0;
    }
}
class Node extends DrawObj {
    constructor(mgr) {
        super(mgr);
        this.name = "Node";
        this.pins = [];
        this.w = 300;
        this.h = 200;
        this.border = 10;
        this.layer = 0;
        this.pinwidth = 10;
        this.pinheight = 10;
        this.activities = [];
        this.pinLastIndex = 0;
    }

    len(p1, p2) {
        let sq = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
        return Math.sqrt(sq);
    }
    calcAngle(pt) {
        let center = new Point(this.x + this.w / 2, this.y + this.h / 2);

        let longSideLen = this.len(center, pt);
        let vertSideLen = center.y - pt.y;
        let sinV = vertSideLen / longSideLen;
        let ang1 = Math.asin(sinV) / Math.PI * 180.0;
        if (pt.x > center.x && ang1 < 0) {
            ang1 = 360.0 + ang1;
        }
        else if (pt.x < center.x) {
            ang1 = 180.0 - ang1;
        }

        return ang1;
    }
    calcIntersectionByAngle(angle) {
        let refAng = Math.atan(this.h / this.w) / Math.PI * 180.0;

        let pt = new Point(0, 0);
        let center = new Point(this.x + this.w / 2, this.y + this.h / 2);
        if (angle < 180.0) {
            let ang1 = angle / 180.0 * Math.PI;
            if (angle > refAng && angle < (180 - refAng)) {
                pt.y = center.y - this.h / 2;
                pt.x = center.x + this.h / 2 / Math.tan(ang1);
            }
            else {
                if (angle <= refAng) {
                    pt.y = center.y - this.w / 2 * Math.tan(ang1);
                    pt.x = center.x + this.w / 2 - this.border;
                }
                else {
                    pt.y = center.y + this.w / 2 * Math.tan(ang1);
                    pt.x = center.x - this.w / 2;
                }
            }
        }
        else {
            let ang1 = (180 - angle) / 180.0 * Math.PI;
            if (angle > (180 + refAng) && angle < (360 - refAng)) {
                pt.y = center.y + this.h / 2 - this.border;
                pt.x = center.x + this.h / 2 / Math.tan(ang1);
            }
            else {
                if (angle <= (180 + refAng)) {
                    pt.x = center.x - this.w / 2;
                    pt.y = center.y - this.w / 2 * Math.tan(ang1);
                }
                else {
                    pt.x = center.x + this.w / 2 - this.border;
                    pt.y = center.y + this.w / 2 * Math.tan(ang1);
                }
            }
        }
        return pt;
    }
    addPin(dir) {
        var pin = new NodePin(this);
        pin.name = "conn_" + this.pinLastIndex.toString();
        this.pinLastIndex++;
        this.pins.push(pin);
        return pin;
    }
    load(jsonObj) {
        super.load(jsonObj);
        let pins = jsonObj["pins"];
        let lastIndex = -1;
        for (let i in pins) {
            let item = pins[i];
            var pin = new NodePin(this);
            pin.name = item[0];
            if (pin.name != null && pin.name.length >= 6) {
                let strIdx = pin.name.substring(5);
                let idx = parseInt(strIdx);
                if (lastIndex < idx) {
                    lastIndex = idx;
                }
            }
            pin.angle = item[1];
            this.pins.push(pin);
        }
        this.pinLastIndex = lastIndex + 1;
    }
    findPin(name) {
        for (let i in this.pins) {
            let pin = this.pins[i];
            if (pin.name == name) {
                return pin;
            }
        }
        return null;
    }
    save() {
        let jsonObj = super.save();
        let pinList = [];
        for (let i in this.pins) {
            let pin = this.pins[i];
            pinList.push([pin.name, pin.angle]);
        }
        jsonObj["pins"] = pinList;
        return jsonObj;
    }

    getPinRect(pin) {
        let pt = this.calcIntersectionByAngle(pin.angle);
        let rc = new Rect(
            pt.x,
            pt.y,
            this.pinwidth,
            this.pinheight);
        return rc;
    }
    hitTest(x, y) {
        if (x >= (this.x + this.border)
            && x <= (this.x + this.w - this.border)
            && y >= (this.y + this.border)
            && y <= (this.y + this.h - this.border)) {
            this.keep();
            return HitState.Hit;
        }
        else {
            let baseHit = super.hitTest(x, y);
            if (baseHit == HitState.Hit) {
                //inside border
                let canPt = new Point(x, y);
                let angle = this.calcAngle(canPt);
                let pin = this.addPin(PinDirection.out);
                pin.angle = angle;
                let connObj = this.mgr.setSelectedPin(this, pin, canPt.x, canPt.y);
                if (connObj != null) {
                    connObj.StraightLine = true;
                }
                return HitState.HitPin;
            }
            return HitState.NotHit;
        }
    }
    render(ctx) {
        if (this.state == ObjState.selected) {
            ctx.strokeStyle = 'red';
        }
        else {
            ctx.strokeStyle = 'RoyalBlue';//'blue';
        }

        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.w, this.h, 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.roundRect(this.x + this.border, this.y + this.border,
            this.w - 2 * this.border, this.h - 2 * this.border, 20);
        ctx.stroke();
        ctx.setLineDash([]);

        //Name
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        let name = this.name;
        if (this.id > 0) {
            name += "-" + this.id;
        }
        ctx.fillText(name, this.x + this.w / 2, this.y);
    }
    recalc() {
        let x = null;
        let y = null;
        let rx = null;
        let ry = null;
        for (let i in this.activities) {
            let act = this.activities[i];
            if (x == null || act.x <= x) {
                x = act.x;
            }
            if (y == null || act.y <= y) {
                y = act.y;
            }
            if (rx == null || (act.x + act.w) >= rx) {
                rx = act.x + act.w;
            }
            if (ry == null || (act.y + act.h) >= ry) {
                ry = act.y + act.h;
            }
        }
        if (x != null) {
            this.x = x - 30;
        }
        if (y != null) {
            this.y = y - 30;
        }
        if (rx != null) {
            this.w = rx - x + 60;
        }
        if (ry != null) {
            this.h = ry - y + 60;
        }
    }
    add(act) {
        this.activities.push(act);
        act.node = this;
        this.recalc();
    }
    remove(act) {
        for (let i in this.activities) {
            let it = this.activities[i];
            if (it == act) {
                this.activities.splice(i, 1);
                break;
            }
        }
        act.node = null;
        this.recalc();
    }
    keep() {
        for (let i in this.activities) {
            let it = this.activities[i];
            it.keep();
        }
        super.keep();
    }
    move(offX, offY, ctrlKeyPressed) {
        for (let i in this.activities) {
            let it = this.activities[i];
            it.move(offX, offY, ctrlKeyPressed);
        }
        super.move(offX, offY, ctrlKeyPressed);
    }
}
class Activity extends DrawObj {
    constructor(mgr) {
        super(mgr);
        this.pins = [];
        this.hoverPin = null;
        this.node = null;
        this.layer = 1;

        this.pinspace = 20;
        this.pinwidth = 10;
        this.pinheight = 16;
        this.nodeId = null;//for loading
    }
    save() {
        let jsonObj = super.save();
        if (this.node != null) {
            jsonObj["node"] = this.node.id;
        }
        return jsonObj;
    }
    load(jsonObj) {
        super.load(jsonObj);
        this.nodeId = jsonObj["node"];
    }
    postLoad() {
        if (this.nodeId == null) {
            return;
        }

        let nodeObj = this.mgr.findObj("Node", this.nodeId);
        if (nodeObj != null) {
            this.node = nodeObj;
            nodeObj.activities.push(this);
            this.nodeId = null;
        }
    }
    findPin(name) {
        for (let i in this.pins) {
            let pin = this.pins[i];
            if (pin.name == name) {
                return pin;
            }
        }
        return null;
    }
    addPin(name, dir) {
        var pin = new Pin(this);
        pin.name = name;
        pin.dir = dir;
        this.pins.push(pin);
    }
    renderPin(ctx, off, pin) {
        if (pin == this.hoverPin) {
            ctx.strokeStyle = 'red';
        }
        else {
            ctx.strokeStyle = 'blue';
        }
        let rc = this.getPinRectWithOff(off, pin);
        ctx.beginPath();
        ctx.rect(rc.x, rc.y, rc.w, rc.h);
        ctx.stroke();

        let x, y;
        if (pin.dir == PinDirection.in) {
            x = rc.x + rc.w / 2;
            y = rc.y + rc.h / 2;
            ctx.textAlign = "left";
        }
        else {
            x = rc.x;
            y = rc.y + rc.h / 2;
            ctx.textAlign = "right";
        }
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        let name = pin.name;
        ctx.fillText(name, rc.x + rc.w / 2, rc.y + rc.h / 2);

    }
    getPinRect(matchPin) {
        let self = this;
        let pinOff = 0;
        let matched = false;
        this.enumAllPins((off, pin) => {
            if (pin == matchPin) {
                pinOff = off;
                matched = true;
                return true;
            }
            else {
                return false;
            }
        });
        if (matched) {
            return this.getPinRectWithOff(pinOff, matchPin);
        }
        else {
            return null;
        }
    }
    getPinRectWithOff(off, pin) {
        let rc;
        let x, y, midy;
        if (pin.dir == PinDirection.out) {
            x = this.x + this.w;
            midy = this.y + this.h / 2;
            y = midy + off;
            if ((y + this.pinwidth) > (this.y + this.h)) {
                x = (this.x + this.w) - (off - this.h / 2) - this.pinwidth - 2;
                y = this.y + this.h;
                rc = new Rect(x - this.pinwidth / 2, y, this.pinwidth, this.pinheight);
            }
            else if ((y - this.pinwidth) < this.y) {
                x = (this.x + this.w) - (-off - this.h / 2) - this.pinwidth - 2;
                y = this.y;
                rc = new Rect(x - this.pinwidth / 2, y - this.pinheight, this.pinwidth, this.pinheight);
            }
            else {
                rc = new Rect(x, y - this.pinwidth / 2, this.pinwidth, this.pinheight);
            }
        }
        else {
            x = this.x;
            midy = this.y + this.h / 2;
            y = midy + off;
            if ((y + this.pinwidth) > (this.y + this.h)) {
                x = this.x + (off - this.h / 2) + this.pinwidth + 2;
                y = this.y + this.h;
                rc = new Rect(x - this.pinwidth / 2, y, this.pinwidth, this.pinheight);
            }
            else if ((y - this.pinwidth) < this.y) {
                x = this.x + (-off - this.h / 2) + this.pinmowidth + 2;
                y = this.y;
                rc = new Rect(x - this.pinwidth / 2, y - this.pinheight, this.pinwidth, this.pinheight);
            }
            else {
                rc = new Rect(x - this.pinwidth, y - this.pinheight / 2, this.pinwidth, this.pinheight);
            }
        }
        return rc;
    }
    onMouseLeave(x, y) {
        this.hoverPin = null;
    }
    onMouseHover(x, y) {
        let matchedPin = null;
        this.enumAllPins((off, pin) => {
            let rc = this.getPinRectWithOff(off, pin);
            if (rc.ptInside(x, y)) {
                matchedPin = pin;
                return true;
            }
            else {
                return false;
            }
        });
        this.hoverPin = matchedPin;
    }
    renderPins(ctx, dir) {
        let self = this;
        this.enumPins(dir, (off, pin) => {
            self.renderPin(ctx, off, pin);
            return false;
        });
    }
    enumAllPins(cb) {
        this.enumPins(PinDirection.out, cb);
        this.enumPins(PinDirection.in, cb);
    }
    enumPins(dir, cb) {
        //count pins
        let cnt = 0;
        for (let i in this.pins) {
            let pin = this.pins[i];
            if (pin.dir == dir) {
                cnt++;
            }
        }
        let off = 0;
        if (cnt % 2 == 0)//even
        {
            off = this.pinspace / 2 + this.pinwidth / 2;
        }
        let idx = 0;
        let dirc = -1;
        for (let i in this.pins) {
            let pin = this.pins[i];
            if (pin.dir != dir) {
                continue;
            }
            let wantBreak = cb(off, pin);
            if (wantBreak) {
                break;
            }

            idx++;
            off = off + dirc * idx * (this.pinspace + this.pinwidth);
            dirc = -dirc;
        }
    }
    render(ctx) {
        this.renderPins(ctx, PinDirection.out);
        this.renderPins(ctx, PinDirection.in);


        if (this.state == ObjState.selected) {
            ctx.strokeStyle = 'red';
        }
        else {
            ctx.strokeStyle = 'blue';
        }

        ctx.beginPath();
        //ctx.fillStyle = "green";
        //ctx.fillRect(this.x, this.y, this.w,this.h);
        let lw = ctx.lineWidth;
        ctx.lineWidth = 3;
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.stroke();
        ctx.lineWidth = lw;

        super.render(ctx);
    }
    hitTest(x, y) {
        let matchedPin = null;
        let matchedOff = 0;
        this.enumAllPins((off, pin) => {
            let rc = this.getPinRectWithOff(off, pin);
            if (rc.ptInside(x, y)) {
                matchedPin = pin;
                matchedOff = off;
                return true;
            }
            else {
                return false;
            }
        });
        if (matchedPin != null) {
            let canPt = new Point(x, y);
            this.mgr.setSelectedPin(this, matchedPin, canPt.x, canPt.y);
            return HitState.HitPin;//Activity is not in Selected state
        }
        return super.hitTest(x, y);
    }
    removeDependObjs() {
        this.mgr.deleteConnectObjWithActivity(this);
    }
    move(offX, offY, ctrlKeyPressed) {
        super.move(offX, offY, ctrlKeyPressed);
        if (this.node != null && !ctrlKeyPressed) {
            this.node.recalc();
        }
    }

}
class Connect extends DrawObj {
    constructor(mgr) {
        super(mgr);
        this.StartActivity = null;
        this.StartPin = null;
        this.layer = 2;
        this.name = "Connect";

        this.EndActivity = null;
        this.EndPin = null;

        this.jsonObj = null;
        this.StraightLine = false;
    }
    save() {
        let jsonObj = super.save();
        if (this.StartActivity != null) {
            if (this.StartActivity.node != null) {
                jsonObj["StartNode"] = this.StartActivity.node.id;
            }
            jsonObj["StartObject"] = this.StartActivity.name + "." + this.StartActivity.id;
        }
        if (this.StartPin != null) {
            jsonObj["StartPin"] = this.StartPin.name;
        }

        if (this.EndActivity != null) {
            if (this.EndActivity.node != null) {
                jsonObj["EndNode"] = this.EndActivity.node.id;
            }
            jsonObj["EndObject"] = this.EndActivity.name + "." + this.EndActivity.id;
        }
        if (this.EndPin != null) {
            jsonObj["EndPin"] = this.EndPin.name;
        }
        return jsonObj;
    }
    isCompleted() {
        if (this.StartPin != null && this.EndPin != null) {
            return true;
        }
        else {
            return false;
        }
    }
    hitTest(x, y) {
        if (this.StartPin == null || this.EndPin == null) {
            return HitState.NotHit;
        }
        let startPinRC = this.StartActivity.getPinRect(this.StartPin);
        let startPoint = new Point(startPinRC.x + startPinRC.w / 2, startPinRC.y + startPinRC.h / 2);
        let endPinRC = this.EndActivity.getPinRect(this.EndPin);
        let endPoint = new Point(endPinRC.x + endPinRC.w / 2, endPinRC.y + endPinRC.h / 2);

        let testPoint = new Point(x, y);

        function len(p1, p2) {
            let sq = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
            return Math.sqrt(sq);
        }
        function inline(p1, p2, p) {
            let l = len(p1, p2);
            let l1 = len(p1, p);
            let l2 = len(p, p2);
            let diff = Math.abs(l - (l1 + l2));
            return (diff < 0.5);
        }
        let isHit = false;
        let segs = this.lineSegs(startPoint, endPoint);
        for (var i = 0; i < segs.length - 1; i++) {
            isHit = inline(new Point(segs[i].x, segs[i].y),
                new Point(segs[i + 1].x, segs[i + 1].y),
                testPoint);
            if (isHit) {
                break;
            }
        }
        if (isHit) {
            return HitState.Hit;
        }
        else {
            return HitState.NotHit;
        }
    }
    lineSegs(startPoint, endPoint) {
        let midPoint = new Point((startPoint.x + endPoint.x) / 2,
            (startPoint.y + endPoint.y) / 2);
        return [new Point(startPoint.x, startPoint.y),
        new Point(midPoint.x, startPoint.y),
        new Point(midPoint.x, endPoint.y),
        new Point(endPoint.x, endPoint.y)];
    }
    renderLine(ctx, startPoint, endPoint) {
        let segs = this.lineSegs(startPoint, endPoint);
        for (var i = 0; i < segs.length - 1; i++) {
            ctx.moveTo(segs[i].x, segs[i].y);
            ctx.lineTo(segs[i + 1].x, segs[i + 1].y);
        }
    }
    renderLine2(ctx, startPoint, endPoint) {
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
    }
    render(ctx) {
        if (this.StartActivity == null || this.StartPin == null) {
            return;
        }
        let startPinRC = this.StartActivity.getPinRect(this.StartPin);
        let startPoint = new Point(startPinRC.x + startPinRC.w / 2, startPinRC.y + startPinRC.h / 2);
        let hasEndPin = false;
        let endPoint = new Point(this.x, this.y);
        if (this.EndActivity != null && this.EndPin != null) {
            let endPinRC = this.EndActivity.getPinRect(this.EndPin);
            endPoint = new Point(endPinRC.x + endPinRC.w / 2, endPinRC.y + endPinRC.h / 2);
            hasEndPin = true;
        }

        let lw = ctx.lineWidth;
        if (this.StraightLine) {
            if (this.state == ObjState.selected) {
                ctx.strokeStyle = 'red';
            }
            else {
                ctx.strokeStyle = 'GoldenRod';
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(startPoint.x,
                startPoint.y, 5, 0, 2 * Math.PI);
            ctx.stroke();
            if (hasEndPin) {
                ctx.beginPath();
                ctx.arc(endPoint.x,
                    endPoint.y, 2, 0, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.beginPath();
            this.renderLine2(ctx, startPoint, endPoint);
            ctx.stroke();
        }
        else {
            if (this.state == ObjState.selected) {
                ctx.strokeStyle = 'red';
            }
            else {
                ctx.strokeStyle = 'darkgreen';
            }
            ctx.lineWidth = 3;
            ctx.beginPath();
            this.renderLine(ctx, startPoint, endPoint);
            ctx.stroke();
        }
        ctx.lineWidth = lw;
    }
    load(jsonObj) {
        super.load(jsonObj);
        this.jsonObj = jsonObj;
    }
    splitNameWithID(objName) {
        let name = objName;
        let id = 0;
        let n = objName.lastIndexOf('.');
        if (n > 0) {
            name = objName.substring(0, n);
            let lastPart = objName.substring(n + 1);
            id = parseInt(lastPart);
        }
        return [name, id];
    }
    postLoad() {
        if (this.jsonObj == null) {
            return;
        }
        let nameStartActivity = this.jsonObj["StartObject"];
        if (nameStartActivity != null) {
            let pair = this.splitNameWithID(nameStartActivity);
            let name = pair[0];
            let id = pair[1];
            let actObj = this.mgr.findObj(name, id);
            if (actObj != null) {
                this.StartActivity = actObj;
                let nameStartPin = this.jsonObj["StartPin"];
                let matchedPin = actObj.findPin(nameStartPin);
                if (matchedPin != null) {
                    this.StartPin = matchedPin;
                }
            }
            if (name == "Node") {
                this.StraightLine = true;
            }
        }
        let nameEndActivity = this.jsonObj["EndObject"];
        if (nameEndActivity != null) {
            let pair = this.splitNameWithID(nameEndActivity);
            let name = pair[0];
            let id = pair[1];
            let actObj = this.mgr.findObj(name, id);
            if (actObj != null) {
                this.EndActivity = actObj;
                let nameEndPin = this.jsonObj["EndPin"];
                let matchedPin = actObj.findPin(nameEndPin);
                if (matchedPin != null) {
                    this.EndPin = matchedPin;
                }
            }
        }
        this.jsonObj = null;//don't need again, release to reduce memory usage
    }
}

// export { GraphManager }