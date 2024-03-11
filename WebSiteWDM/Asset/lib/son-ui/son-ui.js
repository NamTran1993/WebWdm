function ItemContextMenuCL(infoInit, contextmenu) {

    var _ItemContextMenuCL = this;
    this.ID = infoInit.id || SUtil.GetRadomKeyPlus('imu');
    this.html = infoInit.html || "";
    this.IconFrontHtml = infoInit.iconFront || "";
    this.Func = infoInit.func || null;
    this.IconEndHtml = infoInit.iconEnd || "";
    this.Class = infoInit.class || "";
    this.CloseAfterClick = SUtil.Default(infoInit.closeAfterClick, true);
    this.Visible = infoInit.Visible || true;
    this.type = infoInit.type || 'item';

    this.JSender = null;
    this.Parent = contextmenu;

    this.Set = function (info) {
        if (info.Visible !== undefined) {
            this.Visible = info.Visible;
            if (this.Visible) {
                this.JSender.css('display', 'table-row');
            }
            else {
                this.JSender.css('display', 'none');
            }
        }

        if (info.html !== undefined) {
            this.html = info.html;
            document.getElementById(`item-menu-${this.ID}`).innerHTML = this.html;
        }

        //this.Render();
    };

    this.Render = function (container) {
        if (this.JSender === null) {

            if (this.type == 'item') {

                let script = `<tr class="item ${this.Class}" id="${this.ID}">
                                <td role="iconFront">${this.IconFrontHtml}</td>
                                <td role="name" id="item-menu-${this.ID}">${this.html}</td>
                                <td role="iconEnd">${this.IconEndHtml}</td>
                            </tr>`;

                container.append(script);
                this.JSender = SUtil.J(this.ID);
                this.JSender.mouseenter(function (e) { _ItemContextMenuCL.MouseFocus(e); });
                this.JSender.click(function () {
                    if (_ItemContextMenuCL.Func !== null) { _ItemContextMenuCL.Func(); }
                    if (_ItemContextMenuCL.CloseAfterClick) { _ItemContextMenuCL.Parent.CloseAll(); }
                });
            }
            else if (this.type == 'line') {
                let script = `<tr class="space"><td colspan="3"></td></tr>
                              <tr class="line" id="${this.ID}"><td colspan="3"></td></tr>
                              <tr class="space"><td colspan="3"></td></tr>`;
                container.append(script);
                this.JSender = SUtil.J(this.ID);
            }
            else if (this.type == 'text') {
                let script = `<tr class="${this.Class}" id="${this.ID}"><td colspan="3">${this.html}</td></tr>`;
                container.append(script);
                this.JSender = SUtil.J(this.ID);
            }

        }

    };

    this.MouseFocus = function (e) {
        var pParent = this.Parent.GetSize();
        var position = this.JSender.position();

        var offsetX = pParent.x + pParent.width + 1;
        var offsetY = pParent.y + position.top + 1;

        var wf = $(window).width();
        if ((offsetX + pParent.width) > wf) {
            offsetX = pParent.x - (pParent.width + 1);
        }

        this.Parent.MouseFocusItem(this);
        if (this.MapContextMenu !== null) {
            this.MapContextMenu.Open(offsetX + 20, offsetY);
        }
    };
    this.LostFocus = function () {
        if (this.MapContextMenu !== null) {
            this.MapContextMenu.Close();
        }
    };
    this.MapContextMenu = infoInit.mapContextMenu || null; // Mapping to anothor context menu when Move Hover
}
var ContextMenuLst = new Array();
function ContextMenuCL(infoInit) {

    var _ContextMenuCL = this;
    ContextMenuLst.push(this);

    this.ID = infoInit.id || SUtil.GetRadomKeyPlus('cme');
    this.JSender = null;
    this.JContainer = null;

    this.Position = { x: 0, y: 0 };
    this.size = infoInit.size || { width: 'auto', height: 'auto' };

    var mBackgroundID = "sct-menu-bg";
    this.JBackGround = SUtil.J(mBackgroundID);

    //#region IF NOT EXIST --> CREATE
    if (this.JBackGround.length === 0) {

        $('body').append(String.format('<div id="{0}"></div>', mBackgroundID));
        this.JBackGround = SUtil.J(mBackgroundID);
        this.JBackGround.click(function (e) {
            var container = $(".sct-menu");
            if (!container.is(e.target) // if the target of the click isn't the container...
                && container.has(e.target).length === 0) // ... nor a descendant of the container
            {
                _ContextMenuCL.JBackGround.hide();
                for (var i = 0; i < ContextMenuLst.length; i++) {
                    ContextMenuLst[i].Close();
                }
            }
        });
        this.JBackGround.bind('contextmenu', function (e) { return false; });


        $(document).click(function (e) {
            if (e.button === 0) {
                _ContextMenuCL.JBackGround.hide();
                for (var i = 0; i < ContextMenuLst.length; i++) {
                    ContextMenuLst[i].Close();
                }
            }
        });
        $(document).bind('contextmenu', function (e) { return false; });

    }
    //#endregion

    this.Items = new Array();
    if (infoInit.items !== undefined) {
        var items = infoInit.items;
        for (var i = 0; i < items.length; i++) {
            var itemContextMenu = new ItemContextMenuCL(items[i], this);
            this.Items.push(itemContextMenu);
        }
    }

    this.Render = function () {
        this.JSender = SUtil.J(this.ID);
        if (this.JSender.length === 0) {

            var mScript = `<div id="${this.ID}" style="width: ${this.size.width}; height: ${this.size.height}" class="sct-menu">
                                <table id="tb${this.ID}"></table>
                            <div>`;

            $('body').append(mScript);
            this.JSender = SUtil.J(this.ID);
            this.JContainer = SUtil.J("tb" + this.ID);
        }
        for (var i = 0; i < this.Items.length; i++) {
            this.Items[i].Render(this.JContainer);
        }
    };
    this.Render();

    this.Active = false;
    this.Open = function (offsetx, offsety) {
        this.JSender.show();

        var wf = $(window).width();
        var hf = $(window).height();

        var padding = 11;
        var wm = this.JSender.width() + padding * 2;
        var hm = this.JSender.height() + padding * 2;

        if ((offsetx + wm) > wf) { offsetx = wf - wm; }
        if ((offsety + hm) > hf) { offsety = hf - hm; }

        this.Position.x = offsetx;
        this.Position.y = offsety;

        this.JSender.css({ 'left': offsetx + 'px', 'top': offsety + 'px' });

        this.Active = true;
        this.JSender.show();

    };
    this.Close = function () {
        this.JSender.hide();
        this.Active = false;

        for (var i = 0; i < ContextMenuLst.length; i++) {
            if (ContextMenuLst[i].Active) { return; }
        }
        this.JSender.hide();
    };
    this.CloseAll = function () {
        for (var i = 0; i < ContextMenuLst.length; i++) {
            ContextMenuLst[i].Active = false;
            ContextMenuLst[i].JSender.hide();
        }
        this.JBackGround.hide();
    };
    this.MouseFocusItem = function (itemObj) {
        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i] !== itemObj) { this.Items[i].LostFocus(); }
        }
    };
    this.GetSize = function () {
        var position = this.JSender.position();
        var width = this.JSender.width();
        var heigth = this.JSender.height();
        return { x: position.left, y: position.top, width: width, height: heigth };
    };
}


function DatePickerCL(infoInit) {

    this.format = SUtil.Default(infoInit.format, "MM/dd/yyyy");
    this.placeholder = SUtil.Default(infoInit.placeholder, this.format);
    this.id = SUtil.Default(infoInit.id, SUtil.AutoElementId());
    this.parentId = SUtil.Default(infoInit.parentId, "body");
    this.dateDefault = SUtil.Default(infoInit.date, null);

    this.maxDate = SUtil.Default(infoInit.maxDate, new Date(2050, 0, 1, 0, 0, 0));
    this.minDate = SUtil.Default(infoInit.minDate, new Date(1900, 0, 1, 0, 0, 0));

    this.direct = 0;

    DatePickerCL.register(this);

    this.view = { year: 2020, month: 0, date: 1, hour: 0, minute: 0, second: 0 };
    this.date = { year: 2020, month: 0, date: 10, hour: 0, minute: 0, second: 0 };

    this.createHtmlInput = function () {

        let dateDefault = '';
        if (this.dateDefault !== null) {
            dateDefault = TimeUtil.dateToText(this.dateDefault, this.format);
        }

        var html = `
            <div class="input-group mb-3 datetime-piker" id="${this.id}">
                <input type="text" id="${this.id}_input" class="form-control form-control-sm" placeholder="${this.placeholder}" value="${dateDefault}" onblur="DatePickerCL.onblur('${this.id}')">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary btn-sm btn-calendar" style="border-color: #ccc" type="button" onclick="DatePickerCL.open(event,'${this.id}')">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                </div>
            </div>
        `;
        document.getElementById(this.parentId).innerHTML = html;
        document.getElementById(this.parentId).style.position = 'relative';
    }

    this.createHtmlPopup = function () {

        let format = this.format.toLowerCase();

        //#region YEAR / MONTH
        var html_year_month = '';
        if (format.indexOf('yyyy') >= 0) {

            var html_select_months = '';
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novemeber', 'Decemeber'];

            for (let i = 0; i < months.length; i++) {
                var select = i == this.view.month ? 'selected' : '';
                html_select_months += `<option value="${i}" ${select}>${months[i]}</option>`;
            }

            var html_select_year = '';

            let maxYear = this.maxDate.getFullYear();
            for (let i = this.minDate.getFullYear(); i <= maxYear; i++) {
                var select = i == this.view.year ? 'selected' : '';
                html_select_year += `<option value="${i}" ${select}>${i}</option>`;
            }

            html_year_month = `
                <div class="_dYM">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <button class="btn btn-light btn-sm" type="button" onclick="DatePickerCL.nextView('${this.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                        </div>
                        <select class="form-control form-control-sm" onchange="DatePickerCL.changeViewMonth('${this.id}', this)" style="width:70px">
                           ${html_select_months}
                        </select>
                        <select class="form-control form-control-sm"  onchange="DatePickerCL.changeViewYear('${this.id}', this)">
                            ${html_select_year}
                        </select>
                        <div class="input-group-append">
                            <button class="btn btn-light  btn-sm" type="button" onclick="DatePickerCL.nextView('${this.id}', 1)"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
                `;

        }
        //#endregion

        //#region DATE
        var html_date = '';
        if (format.indexOf('dd') >= 0) {

            var html_lstDate = '';
            let dateCount = 1;

            var firstDay = new Date(this.view.year, this.view.month, 1);
            var lastDay = new Date(this.view.year, this.view.month + 1, 0);
            var offset = firstDay.getDay();

            let dateCurrent = new Date();

            let _minTick = this.minDate.getTime();
            let _maxTick = this.maxDate.getTime();

            for (let i = 0; i < 6; i++) {
                let html_td = '';
                for (let rw = 0; rw < 7; rw++) {
                    if (offset === 0) {

                        if (dateCount > lastDay.getDate()) { break; }

                        var selected = this.date.date === dateCount && this.date.year === this.view.year && this.date.month == this.view.month ? 1 : 0;
                        var current = dateCurrent.getDate() === dateCount && dateCurrent.getFullYear() === this.view.year && dateCurrent.getMonth() == this.view.month ? 1 : 0;

                        var value = new Date(this.view.year, this.view.month, dateCount, 0, 0, 0).getTime();
                        if (value >= _minTick && value <= _maxTick) {
                            html_td += `<td><button type="button" data-selected="${selected}"  data-current="${current}" onclick="DatePickerCL.chooseDate('${this.id}', ${dateCount})">${dateCount}</button></td>`;
                        }
                        else {
                            html_td += `<td data-disabled="true">${dateCount}</td>`;
                        }
                        dateCount++;
                    } else {
                        html_td += '<td>&nbsp;</td>';
                        offset--;
                    }
                }
                html_lstDate += `<tr>${html_td}</tr>`;
            }

            var weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            html_date = `
                <div class="_dD" style="min-height:175px">
                    <table>
                        <tr>
                            <th>${weeks[0]}</th>
                            <th>${weeks[1]}</th>
                            <th>${weeks[2]}</th>
                            <th>${weeks[3]}</th>
                            <th>${weeks[4]}</th>
                            <th>${weeks[5]}</th>
                            <th>${weeks[6]}</th>
                        </tr>
                        ${html_lstDate}
                    </table>
                </div>
            `;
        }
        //#endregion

        //#region TIME
        var html_time = '';
        if (format.indexOf('hh:mm:ss') >= 0) {
            html_time = `            
                <div class="_dTIME">
                    <table>
                        <tr>
                            <td>
                                <input type="number" class="form-control form-control-sm" min="0" max="23" value="${this.date.hour}" id="${this.id}_hour" onchange="DatePickerCL.updateTime('${this.id}')" /></td>
                            <td>:</td>
                            <td>
                                <input type="number" class="form-control form-control-sm" min="0" max="59" value="${this.date.minute}"  id="${this.id}_minute"  onchange="DatePickerCL.updateTime('${this.id}')"/></td>
                            <td>:</td>
                            <td>
                                <input type="number" class="form-control form-control-sm" min="0" max="59" value="${this.date.second}"  id="${this.id}_second"  onchange="DatePickerCL.updateTime('${this.id}')"/></td>
                        </tr>
                    </table>
                </div>`;
        }

        else if (format.indexOf('hh:mm') >= 0) {
            html_time = `            
                <div class="_dTIME">
                    <table>
                        <tr>
                            <td>
                                <input type="number" class="form-control form-control-sm" min="0" max="23" value="${this.date.hour}" id="${this.id}_hour" onchange="DatePickerCL.updateTime('${this.id}')" /></td>
                            <td>:</td>
                            <td>
                                <input type="number" class="form-control form-control-sm" min="0" max="59" value="${this.date.minute}"  id="${this.id}_minute"  onchange="DatePickerCL.updateTime('${this.id}')"/></td>
                        </tr>
                    </table>
                </div>`;
        }
        //#endregion

        var dateSelected = new Date(this.date.year, this.date.month, this.date.date, this.date.hour, this.date.minute, this.date.second);

        var lbResult = dateSelected.getFullYear() >= 1900 ? TimeUtil.dateToText(dateSelected, this.format) : '&nbsp;';

        var html_footer = `
                        <div class="_lbValue">
                            <p id="${this.id}_result">${lbResult}</p>
                        </div>

                        <div class="_btns">
                            <button class="btn btn-cobalt-primary btn-sm" type="button" onclick="DatePickerCL.done('${this.id}')">Done</button>
                            <button class="btn btn-cobalt-primary btn-sm" type="button" onclick="DatePickerCL.close('${this.id}')">Cancel</button>
                        </div>

                    `;

        if (document.getElementById(this.id + '_extend') == null) {
            let div = document.createElement('div');
            div.setAttribute('class', 'datePickerCL');
            div.setAttribute('id', this.id + '_extend');
            div.setAttribute('onclick', 'DatePickerCL.stopClick(event)');


            document.getElementById(this.parentId).appendChild(div);
        }
        document.getElementById(this.id + '_extend').innerHTML = html_year_month + html_date + html_time + html_footer;
        document.getElementById(this.id + '_extend').setAttribute('data-direct', this.direct);

    }

    this.createHtmlInput();
    //this.createHtmlPopup();

    this.onblur = function () {
        try {

            let dateString = document.getElementById(`${this.id}_input`).value;

            if (dateString === '') return;

            let date = TimeUtil.textToDate(dateString, this.format);
            if (date !== null) {

                if (date.getTime() > this.maxDate.getTime()) {
                    date = this.maxDate;
                }

                if (date.getTime() < this.minDate.getTime()) {
                    date = this.minDate;
                }

                document.getElementById(`${this.id}_input`).value = TimeUtil.dateToText(date, this.format);

            }
            else {
                document.getElementById(`${this.id}_input`).value = '';
            }
        }
        catch (ex) {
            document.getElementById(`${this.id}_input`).value = '';
        }
    }

    this.getNumber = function (utc = false) {
        try {
            this.onblur();

            var dateString = document.getElementById(`${this.id}_input`).value;

            if (dateString == '') return '0';

            let date = TimeUtil.textToDate(dateString, this.format);

            if (utc) {
                return TimeUtil.DateToTextNumberUTC(date);
            }
            else {
                return TimeUtil.DateToTextNumber(date);
            }

        }
        catch (e) { }
        return '0';
    };

    this.getDate = function () {
        var dateString = document.getElementById(`${this.id}_input`).value;
        if (dateString == '') return null;
        return TimeUtil.textToDate(dateString, this.format);
    };

    this.set = function (info) {
        try {
            if (info.date !== undefined) {
                if (info.date !== null) {
                    document.getElementById(`${this.id}_input`).value = TimeUtil.dateToText(info.date, this.format);
                }
                else {
                    document.getElementById(`${this.id}_input`).value = '';
                }
            }

            if (info.enable !== undefined) {

                this.enable = info.enable;
                let sender = document.getElementById(this.id);
                let inputs = sender.getElementsByTagName('input');
                let buttons = sender.getElementsByTagName('button');
                if (this.enable) {
                    //document.getElementById(`${this.id}_input`).setAttribute('disabled', 'disabled');
                    inputs[0].removeAttribute('disabled');
                    buttons[0].removeAttribute('disabled');
                }
                else {
                    //document.getElementById(`${this.id}_input`).removeAttribute(disabled);
                    inputs[0].setAttribute('disabled', 'disabled');
                    buttons[0].setAttribute('disabled', 'disabled');
                }
            }

            if (info.maxDate !== undefined) { this.maxDate = info.maxDate; }
            if (info.minDate !== undefined) { this.minDate = info.minDate; }

        } catch (e) {
            console.log(e);
        }
    };

    this.chooseDate = function (index) {

        this.date.year = this.view.year;
        this.date.month = this.view.month;
        this.date.date = index;

        this.createHtmlPopup();

    }

    this.nextView = function (unit) {
        var date = new Date(this.view.year, this.view.month, 1);
        date.setMonth(date.getMonth() + unit);

        if (date.getTime() > this.maxDate.getTime()) { date = this.maxDate; }
        if (date.getTime() < this.minDate.getTime()) { data = this.minDate; }

        this.view.year = date.getFullYear();
        this.view.month = date.getMonth();
        this.createHtmlPopup();
    }

    this.changeViewYear = function (year) {
        this.view.year = year;
        this.createHtmlPopup();
    }

    this.changeViewMonth = function (month) {
        this.view.month = month;
        this.createHtmlPopup();
    };

    this.updateTime = function () {

        var hour = document.getElementById(this.id + '_hour').value;
        var minute = document.getElementById(this.id + '_minute').value;

        var second = 0;
        if (document.getElementById(this.id + '_second') !== null) {
            second = document.getElementById(this.id + '_second').value;
        }

        function normal(unit, max) {
            try {
                unit = parseInt(unit);
                if (unit > max) unit = max;
                if (isNaN(unit)) { unit = 0; }
                return unit;
            } catch (e) {
                return 0
            }
        }

        this.date.hour = normal(hour);
        this.date.minute = normal(minute);
        this.date.second = normal(second);

        var date = new Date(this.date.year, this.date.month, this.date.date, this.date.hour, this.date.minute, this.date.second);

        if (date.getFullYear() >= 1900) {
            document.getElementById(this.id + "_result").innerHTML = TimeUtil.dateToText(date, this.format);
        }
        else {
            document.getElementById(this.id + "_result").innerHTML = '&nbsp;';
        }

    };

    this.close = function () {
        if (document.getElementById(`${this.id}_extend`) === null)
            return;
        document.getElementById(`${this.id}_extend`).remove();
    };

    this.open = function (event) {
        var y = event.clientY;
        this.direct = y + 300 > window.innerHeight ? 1 : 0;
        let date = this.getDate();
        if (date == null) { date = new Date(); }

        let year = date.getFullYear() < 1900 ? 1900 : date.getFullYear();
        this.date.year = this.view.year = year;

        this.date.month = this.view.month = date.getMonth();
        this.date.date = this.view.date = date.getDate();
        this.date.hour = this.view.hour = date.getHours();
        this.date.minute = this.view.minute = date.getMinutes();
        this.date.second = this.view.second = date.getSeconds();

        this.createHtmlPopup();

    };
    this.done = function () {

        var date = new Date(this.date.year, this.date.month, this.date.date, this.date.hour, this.date.minute, this.date.second);
        if (date.getFullYear() >= 1900) {
            document.getElementById(`${this.id}_input`).value = TimeUtil.dateToText(date, this.format);
        }
        else {
            document.getElementById(`${this.id}_input`).value = '';
        }
        this.close();
    }

    this.clickOustside = function (e) {

        var flyoutElement = document.getElementById(`${this.id}`);
        var targetElement = e.target;  // clicked element
        do {
            if (targetElement == flyoutElement) {
                // This is a click inside. Do nothing, just return.
                //console.log( "Clicked inside!");
                return;
            }
            // Go up the DOM
            targetElement = targetElement.parentNode;

        } while (targetElement);

        // This is a click outside.
        //console.log("Clicked outside!");
        this.close();

    };

    this.clean = function () {

        let date = new Date();

        this.view.year = date.getFullYear();
        this.view.month = date.getMonth();
        this.view.date = date.getDate();
        this.view.hour = date.getHours();
        this.view.minute = date.getMinutes();
        this.view.second = date.getSeconds();

        this.date.year = 0;
        this.date.month = 0;
        this.date.date = 0;

        this.date.hour = 0;
        this.date.minute = 0;
        this.date.second = 0;

        this.createHtmlPopup();

    }
}

DatePickerCL.data = [];
DatePickerCL.find = function (id) { return this.data.find(x => x.id === id); };
DatePickerCL.open = function (id) { var obj = this.find(id); obj.open(); }
DatePickerCL.onblur = function (id) { var obj = this.find(id); obj.onblur(); }
DatePickerCL.chooseDate = function (id, index) { var obj = this.find(id); obj.chooseDate(index); }
DatePickerCL.nextView = function (id, unit) { var obj = this.find(id); obj.nextView(unit); }
DatePickerCL.changeViewYear = function (id, sender) {
    var year = sender.value;
    var obj = this.find(id);
    obj.changeViewYear(parseInt(year));
}
DatePickerCL.changeViewMonth = function (id, sender) {
    var month = sender.value;
    var obj = this.find(id);
    obj.changeViewMonth(parseInt(month));
}
DatePickerCL.updateTime = function (id) { var obj = this.find(id); obj.updateTime(); }
DatePickerCL.done = function (id) { var obj = this.find(id); obj.done(); }
DatePickerCL.close = function (id) { var obj = this.find(id); obj.close(); }
DatePickerCL.open = function (event, id) { var obj = this.find(id); obj.open(event); }
DatePickerCL.stopClick = function (event) { event.stopPropagation(); }
DatePickerCL.register = function (obj) {
    if (this.data.length == 0) {
        document.addEventListener('click', function (e) {
            for (let i = 0; i < DatePickerCL.data.length; i++) {
                DatePickerCL.data[i].clickOustside(e);
            }
        });
    }
    this.data.push(obj);
}

//DatePickerCL.clean = function (id) { var obj = this.find(id); obj.clean(event); }

DatePickerCL.LAN = {
    VN: {
        Year: "Năm",
        Month: "Tháng",
        Months: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
        Weeks: ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"],
        Hour: "Giờ", Minute: "Phút", Second: "Giây",
        Unlimited: "Vô thời hạn"
    },
    EN: {
        Year: "Year",
        Month: "Month",
        Months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novemeber', 'Decemeber'],
        Weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        Hour: "Hour", Minute: "Minute", Second: "Second",
        Unlimited: "Indefinitely"
    }
};
//#region String
String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
};
if (!window.console) console = { log: function () { } };
//#endregion

//#region URL
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results === null) {
        return null;
    }
    else {
        return results[1] || 0;
    }
};
//#endregion

//#region Array
Array.prototype.contains = function (elem) {
    for (var i in this) {
        if (this[i] === elem) return true;
    }
    return false;
};
Array.prototype.remove = function (value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
            this.splice(i, 1);
            break;
        }
    }
    return this;
};

//#endregion

//#region SUtil
var Base64EncodeUnicode = {
    ToBase64: function (mString) {
        try {
            return btoa(encodeURIComponent(mString).replace(/%([0-9A-F]{2})/g, function (match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        }
        catch (e) {
            console.log("Base64EncodeUnicode tobase64 invalid: " + mString);
        }
        return "";
    },
    ToString: function (mBase64) {
        try {
            return decodeURIComponent(Array.prototype.map.call(atob(mBase64), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
        catch (e) { console.log("Base64EncodeUnicode ToString invalid: " + mBase64); }
        return "";
    }
}
var SUtil = {
    Config: null,
    J: function (elementId) {
        var index = elementId.indexOf('#');
        if (index < 0) return $("#" + elementId);
        return $(elementId);
    },
    Guid: function () {
        function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
        return new Date().getTime().toString() + s4() + s4() + s4() + s4();
    },
    GetRadomKey: function () {
        var radom = Math.floor(Math.random() * 10000);
        return new Date().getTime().toString() + "_" + radom.toString();
    },
    GetRadomKeyPlus: function (key) {
        var radom = Math.floor(Math.random() * 10000);
        return key + new Date().getTime().toString() + "_" + radom.toString();
    },
    RefreshPage: function () {
        location.reload();
    },
    PerformFunc: function (func) {
        HandleTimeout.ResetTimeout(func);
    },
    TimerCountDown: function (sender, duration, func) {
        var timer = duration, minutes, seconds;
        var interval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            $(sender).html(minutes + ":" + seconds);
            if (--timer < 0) {
                if (func !== undefined && func !== null) { func(); }
                clearInterval(interval);
            }
        }, 1000);
    },
    HandleMaxMin: function (value, min, max) {
        value = parseInt(value);
        if (isNaN(value)) { return min; }

        if (value > max) { return max; }
        if (value < min) { return min; }
        return value;
    },
    HandleMaxMinFloat: function (value, min, max) {
        value = parseFloat(value);
        if (isNaN(value)) { return min; }

        if (value > max) { return max; }
        if (value < min) { return min; }
        return value;
    },
    ToFixedFloat: function (value) {
        return parseFloat(value.toFixed(2));
    },
    DefaultValue: function (value, defaultValue) {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        return value;
    },
    Default: function (value, defaultValue) {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        return value;
    },
    Base64Transparent: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    IsNaN: function (obj) { return obj === undefined || obj === null; },

    //#region Detect Web Browser
    BrowserVersion: function () {
        //Detect browsers in 2016

        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        if (isOpera) {
            console.log(" Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)");
            return "Opera";
        }

        var isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox) {
            console.log(" Firefox 1.0+");
            return "Firefox";
        }

        try {
            var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
            if (isSafari) {
                //console.log(" Safari 3.0+");
                return "Safari";
            }
        }
        catch (e) {
            //
        }

        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if (isIE) {
            console.log("Internet Explorer 6-11");
            return "IE";
        }

        var isEdge = !isIE && !!window.StyleMedia;
        if (isEdge) {
            console.log(" Edge 20+");
            return "Edge";
        }

        var isChrome = !!window.chrome && !!window.chrome.webstore;
        if (isChrome) {
            console.log(" Chrome 1+");
            return "Chrome";
        }

        //var isBlink = (isChrome || isOpera) && !!window.CSS;
        //if (isBlink) { console.log(" Blink engine detection"); }

        return "N/A";
    },
    //#endregion

    //#region Cookie
    SetCookie: function (cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },
    GetCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    EraseCookie: function (name) { document.cookie = name + '=; Max-Age=0'; },
    //#endregion

    CalcSizeDialog: function (maxWidth, maxHeight) {
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        //console.log(windowWidth + " x " + windowHeight);
        var padding = 0;
        if (windowWidth > 768) {
            padding = 15;
        }
        windowHeight = windowHeight - padding * 2;
        windowWidth = windowWidth - padding * 2;
        var dialogWidth = windowWidth > maxWidth ? maxWidth : windowWidth;
        var dialogHeight = windowHeight > maxHeight ? maxHeight : windowHeight;

        var paddingX = (windowWidth - dialogWidth) / 2;
        if (paddingX < 0) paddingX = 0;

        var paddingY = (windowHeight - dialogHeight) / 2;
        if (paddingY < 0) paddingX = 0;

        return { w: dialogWidth, h: dialogHeight, x: paddingX, y: paddingY };
    },
    GetBrowserDim: function () {
        if (window.innerHeight) {
            return { w: window.innerWidth, h: window.innerHeight };
        } else {
            console.log(" window.innerHeight is unidentified.");
            return { w: document.body.clientWidth, h: document.body.clientHeight };
        }
    },
    CropText: function (mString, maxlength) {
        var htmltemp = '<span title="{0}">{1}</span>';
        if (mString.length > maxlength) {
            mString = String.format(htmltemp, mString, (mString.substring(0, maxlength - 3) + "..."));
        }
        return mString;
    },
    PostError: function (mesg) {
        loadingUI.Close();
        if (mesg === undefined) mesg = LNG.GetValue("common", "msg-error", "Having trouble. Please try again.");
        MESSAGE.ok({ text: mesg });
    },
    GetPara: function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results === null) {
            return null;
        }
        else {
            return results[1] || 0;
        }
    },
    IncludeHTML: function () {
        var z, i, elmnt, file, xhttp;
        /*loop through a collection of all HTML elements:*/
        z = document.getElementsByTagName("*");
        for (i = 0; i < z.length; i++) {
            elmnt = z[i];
            /*search for elements with a certain atrribute:*/
            file = elmnt.getAttribute("data-include-html");
            if (file) {
                /*make an HTTP request using the attribute value as the file name:*/
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        if (this.status === 200) { elmnt.innerHTML = this.responseText; }
                        if (this.status === 404) { elmnt.innerHTML = "Page not found."; }
                        /*remove the attribute, and call this function once more:*/
                        elmnt.removeAttribute("data-include-html");
                        SUtil.IncludeHTML();
                    }
                };
                xhttp.open("GET", file, true);
                xhttp.send();
                /*exit the function:*/
                return;
            }
        }
    },
    Wait: function (msg) { loadingUI.Open(msg); },
    EndWait: function (msg) { loadingUI.Close(); },
    IsWait: function () { return loadingUI.isOpen; },
    Unique: 0,
    AutoElementId: function () {
        this.Unique++;
        return "Unique" + this.Unique;
    }
};
//#endregion
//#region ImageProcess
var ImageUtilities = {
    GetCanvasHidden: function (_elementId) { //Create New / Get Canvas Html5
        var jcanvas = $("#" + _elementId);
        if (jcanvas.length === 0) { $('body').append('<canvas id="' + _elementId + '" class="hidden canvas-hidden"></canvas>'); }
        var canvas = document.getElementById(_elementId);
        return canvas;
    },
    ImageToBase64: function (imgObj, type) {
        var canvas = this.GetCanvasHidden("canvas_ImageToBase64");
        canvas.width = imgObj.width;
        canvas.height = imgObj.height;
        var ctx = canvas.getContext('2d');

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.drawImage(imgObj, -imgObj.width / 2, -imgObj.height / 2, imgObj.width, imgObj.height);
        ctx.restore();

        if (type === 'png') { return canvas.toDataURL("image/png"); }
        else { return canvas.toDataURL("image/jpeg"); }

    },
    FixImageWithSize: function (img, size) {
        function ScaleWithWidth() {
            var scaleW = size.width / img.width;
            var width = size.width;
            var height = parseInt(img.height * scaleW);
            return { scale: scaleW, width: width, height: height };
        }
        function ScaleWidthHeight() {
            var scaleH = size.height / img.height;
            var height = size.height;
            var width = img.width * scaleH;
            return { scale: scaleH, width: width, height: height };
        }

        var result;
        if (img.width > size.width) {
            result = ScaleWithWidth();
            if (result.width <= size.width && result.height <= size.height) { return result; }
        }
        if (img.height > size.height) {
            result = ScaleWidthHeight();
            if (result.width <= size.width && result.height <= size.height) { return result; }
        }
        return { scale: 1, width: img.width, height: img.height };
    },

    ImageToBase64Resize: function (img, maxSize, type) {

        var wCanvas = img.width;
        var hCanvas = img.height;

        var ratio = img.width / img.height;

        if (img.width > maxSize.width) {
            wCanvas = maxSize.width;
            var per = img.width / maxSize.height;
            hCanvas = wCanvas / ratio;
        }

        var canvas = this.GetCanvasHidden("canvas_ImageToBase64");
        canvas.width = wCanvas;
        canvas.height = hCanvas;
        var ctx = canvas.getContext('2d');

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, wCanvas, hCanvas);
        ctx.restore();
        if (type === 'png') { return canvas.toDataURL("image/png"); }
        else { return canvas.toDataURL("image/jpeg"); }

    },

    ImageToBase64ResizeVsRotate: function (img, maxSize, type, rotate) {

        var wCanvas = img.width;
        var hCanvas = img.height;

        var ratio = img.width / img.height;

        if (img.width > maxSize.width) {
            wCanvas = maxSize.width;
            var per = img.width / maxSize.height;
            hCanvas = wCanvas / ratio;
        }

        var scale = wCanvas / img.width;

        var canvas = this.GetCanvasHidden("canvas_ImageToBase64");
        canvas.width = wCanvas;
        canvas.height = hCanvas;
        var ctx = canvas.getContext('2d');

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.rotate(rotate * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        ctx.restore();

        if (type === 'png') { return canvas.toDataURL("image/png"); }
        else { return canvas.toDataURL("image/jpeg"); }

    },

    LimitSizeOfImage: function (img, maxSize, type) {
        var wCanvas = img.width;
        var hCanvas = img.height;

        var ratio = img.width / img.height;

        if (img.width > maxSize.width) {
            wCanvas = maxSize.width;
            var per = img.width / maxSize.height;
            hCanvas = wCanvas / ratio;
        }

        var canvas = this.GetCanvasHidden("canvas_ImageToBase64");
        canvas.width = wCanvas;
        canvas.height = hCanvas;
        var ctx = canvas.getContext('2d');

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, wCanvas, hCanvas);
        ctx.restore();

        var base64Result = "";
        if (type === 'png') { base64Result = canvas.toDataURL("image/png"); }
        else { base64Result = canvas.toDataURL("image/jpeg"); }

        return { base64: base64Result, width: wCanvas, height: hCanvas };
    },

    ImagetoCanvas: function (img, canvasId) {
        if (canvasId === undefined) { canvasId = "imagetoCanvas"; }
        var canvas = ImageUtilities.GetCanvasHidden(canvasId);
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        var hw = canvas.width / 2;
        var hh = canvas.height / 2;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(hw, hh);
        ctx.drawImage(img, -hw, -hh, canvas.width, canvas.height);
        ctx.restore();

        return canvas;
    },


    CropImage: function (img, pointLT, pointRB, canvasid) {

        if (canvasid === undefined) { canvasid = "canvas_crop"; }

        var canvas = this.ImagetoCanvas(img);
        var canvasCrop = this.GetCanvasHidden(canvasid);

        canvasCrop.width = Math.abs(pointRB.x - pointLT.x);
        canvasCrop.height = Math.abs(pointRB.y - pointLT.y);

        var ctxCrop = canvasCrop.getContext('2d');

        var ctx = canvas.getContext('2d');
        var left = Math.min(pointRB.x, pointLT.x);
        var top = Math.min(pointRB.y, pointLT.y);
        var imgData = ctx.getImageData(left, top, canvasCrop.width, canvasCrop.height);

        ctxCrop.putImageData(imgData, 0, 0);
        return canvasCrop.toDataURL("image/jpeg");
    },

    //Need Improve

    CropImageCircle: function (img, pointLT, pointRB, canvasid) {

        if (canvasid === undefined) { canvasid = "canvas_crop"; }

        var canvas = this.ImagetoCanvas(img);
        var canvasCrop = this.GetCanvasHidden(canvasid);

        canvasCrop.width = Math.abs(pointRB.x - pointLT.x);
        canvasCrop.height = Math.abs(pointRB.y - pointLT.y);


        var ctx = canvas.getContext('2d');
        var left = Math.min(pointRB.x, pointLT.x);
        var top = Math.min(pointRB.y, pointLT.y);
        var imgData = ctx.getImageData(left, top, canvasCrop.width, canvasCrop.height);

        var ctxCrop = canvasCrop.getContext('2d');
        ctxCrop.putImageData(imgData, 0, 0);
        var hWidth = canvasCrop.width / 2;
        var hHeight = canvasCrop.height / 2;

        ctxCrop.fillStyle = "black";

        ctxCrop.beginPath();
        ctxCrop.arc(hWidth, hHeight, hWidth, 0, Math.PI);
        ctxCrop.lineTo(0, canvasCrop.width);
        ctxCrop.lineTo(canvasCrop.width, canvasCrop.height);
        ctxCrop.closePath();
        ctxCrop.fill();

        ctxCrop.beginPath();
        ctxCrop.arc(hWidth, hHeight, hWidth, Math.PI, 2 * Math.PI);
        ctxCrop.lineTo(canvasCrop.width, 0);
        ctxCrop.lineTo(0, 0);
        ctxCrop.closePath();
        ctxCrop.fill();


        return canvasCrop.toDataURL("image/jpeg");
    },

    ScaleImage: function (sizeCanvas, sizeImage) {
        var scale = sizeCanvas.width / parseFloat(sizeImage.width);
        var heightFirst = sizeImage.height * scale;
        if (heightFirst > sizeCanvas.height) {
            scale = sizeCanvas.height / parseFloat(sizeImage.height);
        }
        scale = scale.toFixed(2);
        return parseFloat(scale);
    }
};
//#endregion

var InputValidate = {

    //#region Base Func

    //Not use onkeypress
    OnKeyPressAvoidSpecialChars: function (e, specialChars) {
        var code;
        if (!e) { e = window.event; }
        if (e.keyCode) { code = e.keyCode; }
        else if (e.which) { code = e.which; }
        var character = String.fromCharCode(code);
        var offset = specialChars.indexOf(character);
        if (offset >= 0) { return false; }
        return true;
    },
    //Only use onkeypress
    OnKeyPressAllowChars: function (e, chars) {
        var code;
        if (!e) { e = window.event; }
        if (e.keyCode) { code = e.keyCode; }
        else if (e.which) { code = e.which; }

        //if (e.keyCode === 8 || e.keyCode === 46) { return true; }
        var character = String.fromCharCode(code);
        var offset = chars.indexOf(character);
        if (offset >= 0) { return true; }
        return false;
    },

    //#endregion

    //#region KeyPress
    IsInteger: function (evt) {
        return InputValidate.OnKeyPressAllowChars(evt, "0123456789");
    },
    IsNumber: function (evt) {
        return InputValidate.OnKeyPressAllowChars(evt, "0123456789.");
    },
    IsPhone: function (e) {
        return InputValidate.OnKeyPressAllowChars(e, "0123456789-+() ");
    },
    IsAddress: function (e) {
        return InputValidate.OnKeyPressAvoidSpecialChars(e, "~!@#$%^&*()+|\{}[]:;\"?><?\\`");
    },
    AvoidSpecialChars: function (e) {
        return InputValidate.OnKeyPressAvoidSpecialChars(e, "~!@#$%^&*()+|\{}[]:;\"'?><?/\\,.-`");
    },
    IsFax: function (e) {
        var chars = "0123456789-+() ";
        return InputValidate.OnKeyPressAllowChars(e, chars);
    },
    IsUserName: function (e) {
        var chars = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_";
        return InputValidate.OnKeyPressAllowChars(e, chars);
    },
    IsSSN: function (e) {
        var chars = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        return InputValidate.OnKeyPressAllowChars(e, chars);
    },
    //#endregion

    RenderHtml: function () {
        $("input[data-is-integer]").keypress(function (event) {
            return InputValidate.IsInteger(event);
        });
        $("input[data-is-number]").keypress(function (event) {
            return InputValidate.IsNumber(event);
        });
        $("input[data-is-phone]").keypress(function (event) {
            return InputValidate.IsPhone(event);
        });
        $("input[data-is-address]").keypress(function (event) {
            return InputValidate.IsAddress(event);
        });
        $("textarea[data-is-address]").keypress(function (event) {
            return InputValidate.IsAddress(event);
        });
        $("input[data-avoid-specialchars]").keypress(function (event) {
            return InputValidate.AvoidSpecialChars(event);
        });
        $("input[data-is-fax]").keypress(function (event) {
            return InputValidate.IsFax(event);
        });
        $("input[data-is-username]").keypress(function (event) {
            return InputValidate.IsUserName(event);
        });
        $("input[data-is-ssn]").keypress(function (event) {
            return InputValidate.IsSSN(event);
        });
    },

    RegPhone: function (phone) {
        var phoneReg = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
        return phoneReg.test(phone);
    },

    RegEmail: function (email) {
        var emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailReg.test(email);
    },

    RegPassword: function (password) {
        var passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{5,20}$/g;
        return passwordReg.test(password);
    },

    RegUsername: function (username) {
        var usernameReg = /^[A-Za-z0-9_]{4,20}$/g;
        return usernameReg.test(username);
    }
};

function LNG_ENTRYCL(name, text) {
    this.Name = name;
    this.Text = text;
}
function LNG_SECTIONCL(nodes) {
    this.Name = nodes.getAttribute('name');
    this.Entries = new Array();
    for (var i = 0; i < nodes.children.length; i++) {
        var key = nodes.children[i].getAttribute('name');
        var obj = new LNG_ENTRYCL(key, nodes.children[i].innerHTML);
        this.Entries.push(obj);
    }

    this.GetLNG_ENTRYCLByKey = function (key) {
        for (var i = 0; i < this.Entries.length; i++) {
            if (this.Entries[i].Name === key) {
                return this.Entries[i];
            }
        }
        return null;
    };
}
var LNG = {
    ImAChildPage: false,
    Sections: new Array(),
    FileName: "en.xml",
    Set: function (link) {
        if (localStorage.LNG !== link) {
            localStorage.LNG = link;
            LNG.FileName = localStorage.LNG;
            LNG.ReLoad();
        }
        else {
            LNG.ReLoad();
        }
    },
    Lock: false,

    ReLoad: function () {
        LNG.FileName = localStorage.LNG;

        if (LNG.Lock) {
            console.log("Lock Get Language.");
            return;
        }

        LNG.Lock = true;
        //var requestURL = `${SUtil.Config.URL}LNG/GetLNG.ashx?data=${LNG.FileName.replace('.xml', '')}&t=${SUtil.Config.Version}`;
        var requestURL = `${SUtil.Config.URL}LNG/file/${LNG.FileName}?ver=${SUtil.Config.Version}`;
        $.ajax({
            url: requestURL,
            type: "get",
            async: false,
            success: function (dataResponse) {
                LNG.Lock = false;
                LNG.Parse(dataResponse);
                LNG.RenderHTML();
            },
            error: function () {
                LNG.Lock = false;
                console.log("Load Text Failed");
            }
        });
    },

    Parse: function (xml) {
        var xmlDoc = xml;
        LNG.Sections = new Array();
        var root = xmlDoc.getElementsByTagName("profile")[0];
        for (var i = 0; i < root.children.length; i++) {
            LNG.Sections.push(new LNG_SECTIONCL(root.children[i]));
        }
    },

    Clear: function () { LNG.Sections = new Array(); },

    View: function () {
        if (LNG.ImAChildPage) {
            return parent.LNG.View();
        }
        for (var i = 0; i < LNG.Sections.length; i++) {
            console.log(LNG.Sections[i]);
        }
    },

    GetSectionByKey: function (key) {
        for (var i = 0; i < LNG.Sections.length; i++) {
            if (LNG.Sections[i].Name === key) {
                return LNG.Sections[i];
            }
        }
        return null;
    },

    GetValue: function (sectionKey, key, defaultValue) {
        if (LNG.ImAChildPage) { return parent.LNG.GetValue(sectionKey, key, defaultValue); }
        var section = LNG.GetSectionByKey(sectionKey);
        if (section === null) { return defaultValue !== undefined ? defaultValue : "&nbsp;"; }
        var entryText = section.GetLNG_ENTRYCLByKey(key);
        if (entryText === null) { return defaultValue !== undefined ? defaultValue : "&nbsp;"; }
        return entryText.Text;
    },

    Get: function (sectionKey, key, defaultValue = "") {
        return this.GetValue(sectionKey, key, defaultValue);
    },

    GetAttr: function (key) {
        var lng = key.split('|');
        if (lng.length < 2) return "";
        return this.GetValue(lng[0], lng[1], "");
    },

    RenderHTML: function () {

        //loadingUI
        loadingUI.Create();

        //Update TEXT
        var lngs = $("[data-lng]");
        for (var i = 0; i < lngs.length; i++) {
            var text = LNG.GetAttr($(lngs[i]).attr('data-lng'));
            if (text.length > 0) {
                $(lngs[i]).html(text);
            }
            else {
                console.log("LNG - Not Found: " + $(lngs[i]).attr('data-lng'));
            }
        }
        //Update Tooltip
        var tooltips = $("[data-lng-title]");
        for (var c = 0; c < tooltips.length; c++) {
            var title = LNG.GetAttr($(tooltips[c]).attr('data-lng-title'));
            if (title.length > 0) {
                $(tooltips[c]).attr('title', title);
            }
            else {
                console.log("Exception: lng");
            }
        }

        //Update placeholder
        var placeholders = $("[data-lng-placeholder]");
        for (var j = 0; j < placeholders.length; j++) {
            var placeholder = LNG.GetAttr($(placeholders[j]).attr('data-lng-placeholder'));
            if (placeholder.length > 0) {
                $(placeholders[j]).attr('placeholder', placeholder);
            }
            else {
                console.log("Exception: lng");
            }
        }
        InputValidate.RenderHtml();
    }
};

var loadingUI = {
    isOpen: false,
    Open: function (msg) {
        if (msg === undefined) { msg = LNG.GetValue("button", "pleasewait", "Please Wait..."); }
        msg += '<i onclick="loadingUI.Close()" class="fa fa-times _btn-close"></i>';
        $("#dvWait-msg").html(msg);
        $("#dvWait").css('display', 'flex');
        this.isOpen = true;
    },
    Close: function () {
        $("#dvWait").css('display', 'none');
        this.isOpen = false;
    },
    Create: function () {
        if ($("#dvWait").length > 0) return;
        var htmlTemp = '<div id="dvWait">\
                            <table>\
                                <tr>\
                                    <td><i style="font-size: 50px" class="fa fa-spinner fa-spin" aria-hidden="true"></i></td>\
                                </tr>\
                                <tr>\
                                    <td id="dvWait-msg">Please Wait...</td>\
                                </tr>\
                            </table>\
                        </div >';
        $('body').append(htmlTemp);
    }
};



function ModalCL(info) {

    this.id = SUtil.Default(info.id, SUtil.AutoElementId());
    this.buttons = SUtil.Default(info.buttons, null);
    this.title = SUtil.Default(info.title, '');

    this.type = SUtil.Default(info.type, DIALOG.TYPE.MESSAGE);

    this.html = SUtil.Default(info.html, '');
    this.include = SUtil.Default(info.include, '');

    this.onOpen = SUtil.Default(info.onOpen, null);
    this.onClose = SUtil.Default(info.onClose, null);

    this.iframe = SUtil.Default(info.iframe, null);

    this.render = function () {

        //#region TILTE 
        var html_title =
            `<div class="modal-header">
                <h5 class="modal-title" id="${this.id}Title">${this.title}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&#x2715</span>
                </button>
            </div>`;
        //#endregion

        //#region BODY
        var html_body = '';
        if (this.iframe === null) {

            var html_body_inner = '';
            if (this.include === '') {
                html_body_inner = this.html;
            }
            else {
                var sender = document.getElementById(this.include);
                if (sender === null) {
                    console.log('render: not found ' + this.include);
                }
                else {
                    var cln = sender.cloneNode(true);
                    sender.parentNode.removeChild(sender);
                    html_body_inner = cln.innerHTML;
                }
            }
            html_body = `<div class="modal-body">${html_body_inner}</div>`;

        }
        else {

            var h = SUtil.Default(this.iframe.height, "300px");
            var src = SUtil.Default(this.iframe.src, "#");
            var id = SUtil.Default(this.iframe.id, SUtil.GetRadomKey('iframe'));

            var html_body_inner = `<iframe src="${src}" id="${id}" class="iframeFull" style="height: ${h}"></iframe>`;
            html_body = `<div class="modal-body" style='padding: 0px'>${html_body_inner}</div>`;

        }

        //#endregion

        //#region FOOTER
        var html_footer = '';
        if (this.buttons != null) {
            var script = '';
            for (let i = 0; i < this.buttons.length; i++) {
                let btn = this.buttons[i];
                let closeAfterClick = btn.closeAfterClick ? 'data-dismiss="modal"' : '';
                script += `<button type="button" class="${btn.class}" ${closeAfterClick} onclick="DIALOG.btnFooterClick('${this.id}', ${i})">${btn.html}</button>`;
            }

            if (script.length > 0)
                html_footer = `<div class="modal-footer justify-content-between">${script}</div>`;
        }
        else {
            html_footer =
                `<div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-cobalt-primary" data-dismiss="modal">Close</button>
                </div>`;
        }
        //#endregion

        var html =
            `<div class="modal fade ${this.type}" id="${this.id}" role="dialog" aria-labelledby="${this.id}Title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered" role="document">
                    <div class="modal-content">
                        ${html_title}
                        ${html_body}
                        ${html_footer}
                    </div>
                </div>
            </div>`;
        var element = document.createElement('div');
        element.innerHTML = html;
        document.getElementsByTagName('body')[0].appendChild(element);

        var sender = $('#' + this.id);
        sender.on('hidden.bs.modal', function (e) {
            try {
                var model = DIALOG.find(e.currentTarget.id);
                if (model.onClose !== null) model.onClose();
            } catch (e) { }
        })
        sender.on('shown.bs.modal', function (e) {
            try {
                var model = DIALOG.find(e.currentTarget.id);
                if (model.onOpen !== null) model.onOpen();
            } catch (e) { }
        })
    }

    this.open = function () {
        if (document.getElementById(this.id) === null) { this.render(); }
        var sender = $('#' + this.id);
        sender.modal({
            backdrop: 'static',
            keyboard: true,
            show: true
        });
    };

    this.close = function () {
        var sender = $('#' + this.id);
        sender.modal('hide');
    };

    DIALOG.data.push(this);
}

function ButtonCL(info) {
    this.html = SUtil.Default(info.html, '');
    this.class = SUtil.Default(info.class, 'btn btn-cobalt-primary');
    this.callback = SUtil.Default(info.callback, null);
    this.closeAfterClick = SUtil.Default(info.closeAfterClick, true);
    this.visible = SUtil.Default(info.visible, true);
}

var DIALOG = {
    data: [],
    TYPE: {
        DIALOG_S: '_modal-dia_s',
        DIALOG_M: '_modal-dia_m',
        DIALOG_L: '_modal-dia_l'
    },
    show: function (info) {
        info.type = SUtil.Default(info.type, DIALOG.TYPE.DIALOG_M);
        var modal = this.data.find(x => x.id === info.id);
        if (modal === undefined) { modal = new ModalCL(info); }
        modal.open();
        return modal;
    },
    btnFooterClick: function (id, index) {
        try {
            var modal = this.data.find(x => x.id === id);
            modal.buttons[index].callback();
        }
        catch (e) { }
    },
    find: function (id) {
        return this.data.find(x => x.id === id);
    }
};

var MESSAGE = {
    convert: function (info) {

        if (info.text !== undefined) {
            info.html = `<p style="text-align:center; margin: 0px; padding: 20px 10px">${info.text}</p>`;
        }
        info.title = SUtil.Default(info.title, "MSYSTEM");
        info.type = SUtil.Default(info.type, DIALOG.TYPE.DIALOG_S);
        return info;

    },
    ok: function (info) {

        info = this.convert(info);
        var btnClose = new ButtonCL({
            html: 'Close', callback: function () {
                if (info.callback !== undefined) {
                    info.callback();
                }
            }, closeAfterClick: true
        });
        info.buttons = [btnClose];
        return DIALOG.show(info);

    },
    show: function (info) {


        info = this.convert(info);
        return DIALOG.show(info);


    }
};
//#region Multiselect
var GMultiselect = {
    CountDiv: 0,
    Data: new Array(),
    Add: function (obj) {
        var bg = $('#mlMultichkBG');
        if (bg.length === 0) {
            $('body').append('<div id="mlMultichkBG"><div></div></div>');
        }
        this.CountDiv++;
        obj.ID = "smulsel-" + this.CountDiv.toString();
        this.Data.push(obj);
        return obj.ID;
    },

    Find: function (id) {
        for (var i = 0; i < this.Data.length; i++) {
            if (this.Data[i].ID === id) return this.Data[i];
        }
        return null;
    },

    ClickItem: function (pid, id) {
        var multichk = this.Find(pid);
        if (multichk === null) {
            console.log("Not Found Multichk");
            return;
        }
        multichk.ItemClick(id);
    },

    Click: function (ms, bExtend) {
        var multichk = this.Find(ms);
        multichk.Set({ extend: bExtend, refresh: true });
    },

    ClickPopup: function (ms, bApply) {
        var multichk = this.Find(ms);
        multichk.Set({ extend: false, refresh: true, resetoldcheck: !bApply });
        $('#mlMultichkBG').css('display', 'none');
        if (bApply && multichk.OnChange !== null) { multichk.OnChange(); }
    }
};

function MultichkItemCL(infoInit) {

    this.id = SUtil.GetRadomKeyPlus("smulsel-a");
    this.parentid = null;
    this.text = "";
    this.tag = null;
    this.func = null;
    this.check = 0;
    this.disable = false;
    this.display = true;

    this.Refresh = function () { SUtil.J(this.id).replaceWith(this.Render()); };
    this.Set = function (info) {
        if (info.id !== undefined) { this.id = info.id; }
        if (info.parentid !== undefined) { this.parentid = info.parentid; }
        if (info.text !== undefined) { this.text = info.text; }
        if (info.tag !== undefined) { this.tag = info.tag; }
        if (info.func !== undefined) { this.func = info.func; }
        if (info.check !== undefined) { this.check = info.check; }
        if (info.disable !== undefined) { this.disable = info.disable; }
        if (info.display !== undefined) { this.display = info.display; }
        if (info.refresh === true) { this.Refresh(); }
    };
    this.Set(infoInit);

    this.Html = '<tr id="{0}" data-check="{4}" onclick="GMultiselect.ClickItem(\'{3}\',\'{0}\')"> \
                    <td data-role="chk">{1}</td> \
                    <td data-role="text">{2}</td> \
                </tr>';

    this.Render = function () {
        var icon = "";
        switch (this.check) {
            case 0: { icon = '<i class="far fa-square"></i>'; break; }
            case 1: { icon = '<i class="fas fa-check-square"></i>'; break; }
            case 2: { icon = '<i class="far fa-minus-square"></i>'; break; }
            default: { icon = '<i class="far fa-square"></i>'; break; }
        }

        return String.format(this.Html, this.id, icon, this.text, this.parentid, this.check);
    };

    this.Click = function (status) {
        if (status === undefined) {
            if (this.check === 1 || this.check === 2) { this.check = 0; }
            else { this.check = 1; }
        }
        else { this.check = status; }
        this.Refresh();
        if (this.func !== null) { this.func(this); }
    };

}

function MultichkDropDownCL(infoInit) {
    //#region Create
    var _MultichkCL = this;
    this.ID = GMultiselect.Add(_MultichkCL);

    this.JElement = infoInit.elementid !== undefined ? SUtil.J(infoInit.elementid) : $('body');
    this.JElement.addClass('multichkDropDown');

    this.JContent = SUtil.J(this.ID);
    this.Extend = false;
    this.Items = new Array();
    this.ChkALL = null;
    this.MaxCharNumber = 40;
    this.PleaseSelect = LNG.GetValue("multiselect", "pleaseselect", "Please Select...");
    this.OnChange = null;

    this.Set = function (info) {

        var i = 0;

        if (info.maxCharNumber !== undefined) { this.MaxCharNumber = info.maxCharNumber; }
        if (info.items !== undefined) {
            for (i = 0; i < info.items.length; i++) {
                info.items[i].id = this.ID + "i-" + i.toString();
                info.items[i].parentid = this.ID;
                this.Items.push(new MultichkItemCL(info.items[i]));
            }
        }
        if (info.chkALL !== undefined) {
            var chkALL = info.chkALL;
            for (i = 0; i < this.Items.length; i++) {
                this.Items[i].check = chkALL.check;
            }
            this.ChkALL = new MultichkItemCL({
                text: SUtil.Default(chkALL.text, "All"), check: chkALL.check, parentid: this.ID, func: function (infoChk) {
                    for (var i = 0; i < _MultichkCL.Items.length; i++) {
                        if (_MultichkCL.Items[i].check !== infoChk.check) {
                            _MultichkCL.Items[i].Set({ check: infoChk.check, refresh: true });
                        }
                    }
                    if (chkALL.func !== null) { chkALL.func(infoChk); }
                }
            });
        }
        if (info.extend !== undefined) { this.Extend = info.extend; }
        if (info.pleaseSelext !== undefined) { this.PleaseSelect = info.pleaseSelext; }
        if (info.refresh === true) { this.Render(); }
    };

    this.Set(infoInit);

    this.Html = {
        DivFull: '<section> \
                    <div> \
                        <table> \
                            <tbody id="{0}"></tbody> \
                        </table> \
                    </div> \
                    <button type="button" onclick="GMultiselect.Click(\'{0}\', false)" class="btn btn-default"> \
                        <i class="fa fa-angle-up"></i> \
                    </button> \
                </section>',

        DivMin: '<button type="button" onclick="GMultiselect.Click(\'{1}\', true)" class="btn btn-default"> \
                    <table> \
                        <tr> \
                            <td data-role="text"><p>{0}<p></td> \
                            <td data-role="icon"> \
                                <i class="fas fa-angle-down"></i> \
                            </td> \
                        </tr> \
                    </table> \
                </button>'
    };

    this.Render = function () {

        var i = 0;
        this.JElement.empty();

        if (this.Extend) {
            this.JElement.html(String.format(this.Html.DivFull, this.ID));
            var jSender = SUtil.J(this.ID);
            if (this.ChkALL !== null) {
                jSender.append(this.ChkALL.Render());
            }
            for (i = 0; i < this.Items.length; i++) {
                jSender.append(this.Items[i].Render());
            }
        }
        else {

            var mSelect = "";
            var countMore = 0;
            var count = 0;
            for (i = 0; i < this.Items.length; i++) {
                if (this.Items[i].check === 1) {
                    if (mSelect.length + this.Items[i].text.length <= this.MaxCharNumber) {
                        mSelect += this.Items[i].text + ", ";
                    }
                    else { countMore++; }
                    count++;
                }
            }

            if (count === 0) { mSelect = "<i>" + this.PleaseSelect + "</i>"; }
            else if (count === this.Items.length && this.Items.length > 0) { mSelect = "ALL"; }
            else {
                mSelect = mSelect.substring(0, mSelect.length - 2);
                if (countMore > 0) {
                    mSelect = mSelect + String.format(LNG.GetValue("multiselect", "moreselected", "...and {0} selected."), countMore);
                }
            }
            var script = String.format(this.Html.DivMin, mSelect, this.ID);
            this.JElement.append(script);
        }
    };

    this.Render();

    this.FindItemByID = function (id) {
        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i].id === id) return this.Items[i];
        }
        return null;
    };

    this.ItemClick = function (id) {
        var itemchk = this.FindItemByID(id);
        if (itemchk !== null) {
            itemchk.Click();

            if (this.ChkALL !== null) {
                var countCheck = 0;
                for (var i = 0; i < this.Items.length; i++) { if (this.Items[i].check) countCheck++; }
                var statusChkAll = 0;
                if (countCheck === 0) { statusChkAll = 0; }
                else if (countCheck === this.Items.length) { statusChkAll = 1; }
                else { statusChkAll = 2; }
                if (this.ChkALL.check !== statusChkAll) { this.ChkALL.Set({ check: statusChkAll, refresh: true }); }
            }

        }
        else if (this.ChkALL !== null && id === this.ChkALL.id) { this.ChkALL.Click(); }
    };
    //#endregion
}

function MultichkPopupCL(infoInit) {


    //#region Create
    var _MultichkCL = this;
    this.ID = GMultiselect.Add(this);

    this.JElement = infoInit.elementid !== undefined ? SUtil.J(infoInit.elementid) : $('body');
    this.JElement.addClass('multichkPopup');

    this.JContent = SUtil.J(this.ID);
    this.Extend = false;
    this.Items = new Array();
    this.ChkALL = null;
    this.MaxCharNumber = 40;
    this.Title = "Select";
    this.PleaseSelect = LNG.GetValue("multiselect", "pleaseselect", "Please Select...");
    this.OnChange = null;
    //#endregion

    this.Set = function (info) {
        var i = 0;
        if (info.items !== undefined) {
            for (i = 0; i < info.items.length; i++) {
                info.items[i].id = this.ID + i.toString();
                info.items[i].parentid = this.ID;
                this.Items.push(new MultichkItemCL(info.items[i]));
            }
        }
        if (info.maxCharNumber !== undefined) { this.MaxCharNumber = info.maxCharNumber; }
        if (info.chkALL !== undefined) {
            var chkALL = info.chkALL;
            for (i = 0; i < this.Items.length; i++) {
                this.Items[i].check = chkALL.check;
            }
            this.ChkALL = new MultichkItemCL({
                text: SUtil.Default(chkALL.text, "All"), check: chkALL.check, parentid: this.ID, func: function (infoChk) {
                    for (var i = 0; i < _MultichkCL.Items.length; i++) {
                        if (_MultichkCL.Items[i].check !== infoChk.check) {
                            _MultichkCL.Items[i].Set({ check: infoChk.check, refresh: true });
                        }
                    }
                    if (chkALL.func !== null) { chkALL.func(infoChk); }
                }
            });
        }

        if (info.resetoldcheck === true) {
            for (i = 0; i < this.Items.length; i++) { this.Items[i].check = this.Items[i].oldCheck; }
            if (this.ChkALL !== null) { this.ChkALL.check = this.ChkALL.oldCheck; }
        }

        if (info.extend !== undefined) {
            this.Extend = info.extend;
            if (this.Extend) {
                //Remember Current Check
                for (i = 0; i < this.Items.length; i++) { this.Items[i].oldCheck = this.Items[i].check; }
                if (this.ChkALL !== null) { this.ChkALL.oldCheck = this.ChkALL.check; }
            }
        }
        if (info.title !== undefined) { this.Title = info.title; }
        if (info.pleaseSelext !== undefined) { this.PleaseSelect = info.pleaseSelext; }
        if (info.refresh === true) { this.Render(); }
    };

    this.Set(infoInit);

    this.Html = {
        DivFull: '<section> \
                    <div data-role="title">{1}</div> \
                    <div data-role="content" style="max-height:{2}px"> \
                        <table><tbody id="{0}"></tbody></table> \
                    </div> \
                    <div data-role="footer"> \
                        <button type="button" onclick="GMultiselect.ClickPopup(\'{0}\', true)" class="btn btn-primary"><i class="fa fa-check"></i> ' + LNG.GetValue("button", "apply", "Apply") + '</button> \
                        <button type="button" onclick="GMultiselect.ClickPopup(\'{0}\', false)" class="btn btn-default"><i class="fa fa-times"></i> ' + LNG.GetValue("button", "cancel", "Cancel") + '</button> \
                    </div> \
               </section >',

        DivMin: '<button type="button" onclick="GMultiselect.Click(\'{1}\', true)" class="btn btn-default"> \
                    <table> \
                        <tr> \
                            <td data-role="text"><p>{0}<p></td> \
                            <td data-role="icon"> \
                                <i class="fas fa-angle-down"></i> \
                            </td> \
                        </tr> \
                    </table> \
                </button>'
    };

    this.Render = function () {

        this.JElement.empty();
        var i = 0;

        if (this.Extend) {
            var size = SUtil.GetBrowserDim();
            var maxHeight = size.h - 100;
            $('#mlMultichkBG').html(String.format(this.Html.DivFull, this.ID, this.Title, maxHeight));
            var jSender = SUtil.J(this.ID);
            if (this.ChkALL !== null) {
                jSender.append(this.ChkALL.Render());
            }
            for (i = 0; i < this.Items.length; i++) {
                jSender.append(this.Items[i].Render());
            }
            $('#mlMultichkBG').css('display', 'flex');
        }

        var mSelect = "";
        var countMore = 0;
        var count = 0;
        for (i = 0; i < this.Items.length; i++) {
            if (this.Items[i].check === 1) {
                if (mSelect.length + this.Items[i].text.length <= this.MaxCharNumber) {
                    mSelect += this.Items[i].text + ", ";
                }
                else { countMore++; }
                count++;
            }
        }

        if (count === 0) { mSelect = "<i>" + this.PleaseSelect + "</i>"; }
        else if (count === this.Items.length && this.Items.length > 0) { mSelect = "ALL"; }
        else {
            mSelect = mSelect.substring(0, mSelect.length - 2);
            if (countMore > 0) {
                mSelect = mSelect + String.format(LNG.GetValue("multiselect", "moreselected", "...and {0} selected."), countMore);
            }
        }

        var script = String.format(this.Html.DivMin, mSelect, this.ID);
        this.JElement.append(script);

    };

    this.Render();

    this.FindItemByID = function (id) {
        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i].id === id) return this.Items[i];
        }
        return null;
    };
    this.ItemClick = function (id) {
        var itemchk = this.FindItemByID(id);
        if (itemchk !== null) {
            itemchk.Click();

            if (this.ChkALL !== null) {
                var countCheck = 0;
                for (var i = 0; i < this.Items.length; i++) { if (this.Items[i].check) countCheck++; }
                var statusChkAll = 0;
                if (countCheck === 0) { statusChkAll = 0; }
                else if (countCheck === this.Items.length) { statusChkAll = 1; }
                else { statusChkAll = 2; }
                if (this.ChkALL.check !== statusChkAll) { this.ChkALL.Set({ check: statusChkAll, refresh: true }); }
            }

        }
        else if (this.ChkALL !== null && id === this.ChkALL.id) { this.ChkALL.Click(); }
    };
}
//#endregion
//------------------------------------------------------------


//#region NEW MULTISELECT
var GSELECT = {
    TYPE: { POPUP: "POPUP", DROP_DOWN: "DROP_DOWN", TOGGLE: "TOGGLE", LIST: "LIST" },

    KIND: { CHECK: 0, RADIO: 1 },

    CountDiv: 0,
    Data: new Array(),
    Add: function (obj) {
        if (this.CountDiv === 0) {
            document.addEventListener("click", function (e) {
                for (var i = 0; i < GSELECT.Data.length; i++) {
                    if (GSELECT.Data[i].Extend && GSELECT.Data[i].Type === GSELECT.TYPE.DROP_DOWN) {
                        GSELECT.Data[i].Set({ Extend: false, Refresh: true });
                    }
                }
            });
        }
        this.CountDiv++;
        obj.ID = "gsel-" + this.CountDiv.toString();
        this.Data.push(obj);
        return obj.ID;
    },

    Find: function (id) {
        for (var i = 0; i < this.Data.length; i++) {
            if (this.Data[i].ID === id) return this.Data[i];
        }
        return null;
    },

    ClickItem: function (event, pid, id) {
        event.stopPropagation();
        var multichk = this.Find(pid);
        if (multichk === null) { console.log("Not Found Multichk"); return; }
        multichk.ItemClick(id);
    },

    Click: function (event, ms, bExtend) {
        event.stopPropagation();
        var multichk = this.Find(ms);
        if (bExtend === undefined || bExtend === null) {
            bExtend = !multichk.Extend;
        }

        multichk.Click(event);

        //multichk.Set({ Extend: bExtend, Refresh: true });
    },

    ClickPopup: function (ms, bApply) {
        var multichk = this.Find(ms);
        multichk.Set({ extend: false, Refresh: true, resetoldcheck: !bApply });
        $('#mlMultichkBG').css('display', 'none');
        if (bApply && multichk.OnChange !== null) { multichk.OnChange(); }
    },

    StopClick: function (event) {
        event.stopPropagation();
    },

    Filter: function (sender, ms) {
        var multichk = this.Find(ms);
        var key = $(sender).val().toLowerCase();
        multichk.Filter(key);
    },

    ICON: {
        Check: '<i class="fas fa-check-square" aria-hidden="true"></i>',
        UnCheck: '<i class="far fa-square" aria-hidden="true"></i>',
        UnCheckALL: '<i class="far fa-minus-square"></i>',
        CheckCircle: '<i class="fas fa-check-circle" aria-hidden="true"></i>',
        UnCheckCircle: '<i class="far fa-circle" aria-hidden="true"></i>'
    }
};

function SCHK_ITEM_CL(infoInit) {

    this.Id = SUtil.GetRadomKeyPlus("smulsel-a");
    this.SelectId = null;
    this.Text = "";
    this.Tag = null;
    this.Func = null;
    this.Check = 0;
    this.Disable = false;
    this.Display = true;
    this.Kind = GSELECT.KIND.CHECK;

    this.Refresh = function () { SUtil.J(this.Id).replaceWith(this.Render()); };

    this.Set = function (info) {
        if (info.Id !== undefined) { this.Id = info.Id; }
        if (info.SelectId !== undefined) { this.SelectId = info.SelectId; }
        if (info.Text !== undefined) { this.Text = info.Text; }
        if (info.Tag !== undefined) { this.Tag = info.Tag; }
        if (info.Func !== undefined) { this.Func = info.Func; }
        if (info.Check !== undefined) { this.Check = info.Check; }
        if (info.Disable !== undefined) { this.Disable = info.Disable; }
        if (info.Display !== undefined) { this.Display = info.Display; }
        if (info.Kind !== undefined) { this.Kind = info.Kind; }
        if (info.Refresh === true) { this.Refresh(); }
    };
    this.Set(infoInit);

    this.Html = '<tr id="{0}" data-check="{4}" onclick="GSELECT.ClickItem(event,\'{3}\',\'{0}\')"> \
                    <td data-role="chk">{1}</td> \
                    <td data-role="text">{2}</td> \
                </tr>';

    this.Render = function () {
        if (!this.Display) { return '<tr id="' + this.Id + '"></tr>'; }
        var icon = "";

        if (this.Kind === GSELECT.KIND.CHECK) {
            switch (this.Check) {
                case 0: { icon = GSELECT.ICON.UnCheck; break; }
                case 1: { icon = GSELECT.ICON.Check; break; }
                case 2: { icon = GSELECT.ICON.UnCheckALL; break; }
                default: { icon = GSELECT.ICON.UnCheck; break; }
            }
        }
        else {
            switch (this.Check) {
                case 0: { icon = GSELECT.ICON.UnCheckCircle; break; }
                case 1: { icon = GSELECT.ICON.CheckCircle; break; }
                default: { icon = GSELECT.ICON.UnCheckCircle; break; }
            }
        }

        return String.format(this.Html, this.Id, icon, this.Text, this.SelectId, this.Check);
    };

    this.Click = function (status) {
        if (status === undefined) {
            if (this.Check === 1 || this.Check === 2) { this.Check = 0; }
            else { this.Check = 1; }
        }
        else { this.Check = status; }
        this.Refresh();
        if (this.Func !== null) { this.Func(this); }
    };
}

function SSELECT_BASE_CL(infoInit) {
    //#region Create
    var OBJ_SSELECT_CL = this;
    this.ID = GSELECT.Add(OBJ_SSELECT_CL);


    this.JElement = infoInit.Sender !== undefined ? SUtil.J(infoInit.Sender) : $('body');
    this.JElement.addClass('SSELECT_CL');

    this.Kind = GSELECT.KIND.CHECK;

    this.JContent = SUtil.J(this.ID);
    this.Extend = false;
    this.Items = new Array();
    this.ChkALL = null;
    this.MaxCharNumber = 18;
    this.PleaseSelect = LNG.GetValue("multiselect", "pleaseselect", "Please Select...");
    this.TextEmpty = 'No Data Available';

    this.Type = GSELECT.TYPE.TOGGLE;
    this.Search = false;
    this.Size = { width: "100%", height: "250px" };
    this.OnChange = null;

    this.Set_Base = function (info) {
        var i = 0;
        if (info.MaxCharNumber !== undefined) { this.MaxCharNumber = info.MaxCharNumber; }
        if (info.Items !== undefined) {
            this.Items = new Array();

            for (i = 0; i < info.Items.length; i++) {
                info.Items[i].Id = this.ID + "i-" + i.toString();
                info.Items[i].SelectId = this.ID;
                this.Items.push(new SCHK_ITEM_CL(info.Items[i]));
            }
            this.UpdateChkAll();
        }

        if (info.ChkALL !== undefined && this.Kind === GSELECT.KIND.CHECK) {

            this.ChkALL = new SCHK_ITEM_CL({
                Text: SUtil.Default(info.ChkALL.Text, "All"), Check: info.ChkALL.Check, SelectId: this.ID, Func: function (infoChk) {
                    for (var i = 0; i < OBJ_SSELECT_CL.Items.length; i++) {
                        if (OBJ_SSELECT_CL.Items[i].Display && OBJ_SSELECT_CL.Items[i].Check !== infoChk.Check) {
                            OBJ_SSELECT_CL.Items[i].Set({ Check: infoChk.Check, Refresh: true });
                        }
                    }
                    if (info.ChkALL.Func !== null) { info.ChkALL.Func(infoChk); } //???
                }
            });

            if (this.ChkALL.Check === 0 || this.ChkALL.Check === 1) {
                for (i = 0; i < this.Items.length; i++) {
                    this.Items[i].Check = this.ChkALL.Check;
                }
            }

        }
        if (info.Extend !== undefined) { this.Extend = info.Extend; }

        if (info.PleaseSelect !== undefined) { this.PleaseSelect = info.PleaseSelect; }

        if (info.TextEmpty !== undefined) { this.TextEmpty = info.TextEmpty; }

        if (info.Size !== undefined) { this.Size = info.Size; }

        if (info.Search !== undefined) { this.Search = info.Search; }
    };

    this.Html = {
        Search: '<div class="_search"><input type="text" class="form-control" onkeyup="GSELECT.Filter(this,\'{0}\')" placeholder="Search"/></div>'
    };

    this.GetTextSelected = function () {

        console.log('GetTextSelected');

        var mSelect = "";
        var countMore = 0;
        var count = 0;

        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i].Check === 1) {
                if (mSelect.length + this.Items[i].Text.length <= this.MaxCharNumber) {
                    mSelect += this.Items[i].Text + ", ";
                }
                else { countMore++; }
                count++;
            }
        }

        if (count === 0) { mSelect = "<i>" + this.PleaseSelect + "</i>"; }
        else if (count === this.Items.length && this.Items.length > 0) { mSelect = "All"; }
        else {
            mSelect = mSelect.substring(0, mSelect.length - 2);
            if (countMore > 0) {
                mSelect = String.format(LNG.GetValue("multiselect", "nselected", "{0} Selected"), count);
            }
        }

        return mSelect;

    };

    this.FindItemByID = function (id) {
        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i].Id === id) return this.Items[i];
        }
        return null;
    };

    this.UpdateChkAll = function () {

        if (this.ChkALL === null) return;

        var countCheck = 0;
        var countDisplay = 0;
        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i].Display) {
                countDisplay++;
                if (this.Items[i].Check) {
                    countCheck++;
                }
            }
        }
        var statusChkAll = 0;
        if (countCheck === 0) { statusChkAll = 0; }
        else if (countCheck === countDisplay) { statusChkAll = 1; }
        else { statusChkAll = 2; }
        if (this.ChkALL.Check !== statusChkAll) {
            this.ChkALL.Set({ Check: statusChkAll, Refresh: true });
        }
    };

    this.ItemClick = function (id) {
        var itemchk = this.FindItemByID(id);
        switch (this.Kind) {
            case GSELECT.KIND.CHECK: {
                if (itemchk !== null) {
                    itemchk.Click();
                    this.UpdateChkAll();
                }
                else if (this.ChkALL !== null && id === this.ChkALL.Id) {
                    this.ChkALL.Click();
                }

                document.getElementById("lb-" + this.ID).innerHTML = this.GetTextSelected();
                break;
            }
            case GSELECT.KIND.RADIO: {
                if (itemchk !== null) {
                    itemchk.Click();
                    for (var i = 0; i < this.Items.length; i++) {
                        if (this.Items[i].Check !== 0 && this.Items[i] !== itemchk) {
                            this.Items[i].Set({ Check: 0, Refresh: true });
                        }
                    }
                }
                document.getElementById("lb-" + this.ID).innerHTML = this.GetTextSelected();
                break;
            }
        }
    };

    this.FilterKey = "";
    this.Filter = function (key) {

        if (this.FilterKey === key) return;
        this.FilterKey = key;

        for (var i = 0; i < this.Items.length; i++) {
            var display = this.Items[i].Text.toLowerCase().search(key) >= 0 ? true : false;
            if (this.Items[i].Display !== display) {
                this.Items[i].Set({ Display: display, Refresh: true });
            }
        }

        this.UpdateChkAll();

        //console.log("Filter:" + this.FilterKey);
    };
    //#endregion
    this.Click = null;//

    this.CleanCheck = function () {
        this.Items.forEach(
            function (item) { item.Check = 0; }
        );
        this.UpdateChkAll();
        this.Render();
    };
}

function SSELECT_TOGGLE_CL(infoInit) {
    SSELECT_BASE_CL.call(this, infoInit);

    this.DIALOG = null;
    this.Type = GSELECT.TYPE.TOGGLE;
    this.JElement.attr('data-t', this.Type);

    this.Html.Button = `<button type="button" onclick="GSELECT.Click(event,\'{1}\')" class="btn btn-default"> 
                            <table> 
                                <tr> 
                                    <td data-role="text" id="lb-{1}"><p>{0}<p></td> 
                                    <td data-role="icon">{2}</td> 
                                </tr> 
                            </table> 
                        </button>`;

    this.Html.DIV = `<section data-t="{1}" style="{2}" onclick="GSELECT.StopClick(event)"> 
                        {3}
                        <div class="_lst" data-s="{4}"> 
                            <table> 
                                <tbody id="{0}"></tbody> 
                            </table> 
                        </div> 
                    </section>`;


    this.Render = function () {
        this.JElement.empty();


        var iconClick = this.Extend ? '<i class="fas fa-angle-up"></i>' : '<i class="fas fa-angle-down"></i>';
        var script = String.format(this.Html.Button, this.GetTextSelected(), this.ID, iconClick);
        this.JElement.append(script);

        if (this.Extend === false) return;

        var css = String.format("height: {0}; width: {1}", this.Size.height, this.Size.width);
        var htmlSearch = this.Search ? String.format(this.Html.Search, this.ID) : "";

        this.JElement.append(String.format(this.Html.DIV, this.ID, this.Type, css, htmlSearch, this.Search));
        var jSender = SUtil.J(this.ID);
        if (this.ChkALL !== null) { jSender.append(this.ChkALL.Render()); }
        for (var i = 0; i < this.Items.length; i++) { jSender.append(this.Items[i].Render()); }


    };

    this.Set = function (info) {
        this.Set_Base(info);
        if (info.Refresh === true) { this.Render(); }
    };
    this.Set(infoInit);

    this.Render();

    this.Click = function () {
        this.Set({ Extend: !this.Extend, Refresh: true });
    };

}

function SSELECT_DROP_CL(infoInit) {
    SSELECT_BASE_CL.call(this, infoInit);

    this.DIALOG = null;
    this.Type = GSELECT.TYPE.DROP_DOWN;
    this.JElement.attr('data-t', this.Type);
    this.Direct = 0;

    this.Html.Button = `<button type="button" onclick="GSELECT.Click(event,'{1}')" class="btn btn-default">
                            <table>
                                <tr>
                                    <td data-role="text" id="lb-{1}"><p>{0}<p></td>
                                    <td data-role="icon">{2}</td>
                                </tr>
                            </table>
                        </button>`;

    this.Html.Empty = `<button type="button"  class="btn btn-default">
                            <table>
                                <tr>
                                    <td data-role="text"><p style="opacity: 0.5; cursor: not-allowed">{0}<p></td>
                                </tr>
                            </table>
                        </button>`;

    this.Html.DIV = `<section data-t="{1}" style="{2}" onclick="GSELECT.StopClick(event)">
                        {3}
                        <div class="_lst" data-s="{4}">
                            <table>
                                <tbody id="{0}"></tbody>
                            </table>
                        </div>
                    </section>`;


    this.Render = function () {

        this.JElement.empty();

        if (this.Items.length > 0) {

            var iconClick = this.Extend ? '<i class="fas fa-angle-up"></i>' : '<i class="fas fa-angle-down"></i>';
            if (this.Direct > 0 && this.Extend) { iconClick = '<i class="fas fa-angle-down"></i>'; }

            var script = String.format(this.Html.Button, this.GetTextSelected(), this.ID, iconClick);
            this.JElement.append(script);

            if (this.Extend === false) return;

            var css = String.format("height: {0}; width: {1}", this.Size.height, this.Size.width);
            if (this.Direct > 0) { css += "; bottom: 100%"; }
            else { css += "; top: 100%"; }

            var htmlSearch = this.Search ? String.format(this.Html.Search, this.ID) : "";
            this.JElement.append(String.format(this.Html.DIV, this.ID, this.Type, css, htmlSearch, this.Search));
            var jSender = SUtil.J(this.ID);
            if (this.ChkALL !== null) { jSender.append(this.ChkALL.Render()); }
            for (var i = 0; i < this.Items.length; i++) { jSender.append(this.Items[i].Render()); }

        }
        else {
            var script = String.format(this.Html.Empty, this.TextEmpty);
            this.JElement.append(script);
        }


    };

    this.Set = function (info) {
        this.Set_Base(info);
        if (info.Refresh === true) { this.Render(); }
    };

    this.Set(infoInit);

    this.Render();

    this.Click = function (event) {
        var y = event.clientY;
        var height = parseInt(this.Size.height) + 32;
        var size = SUtil.GetBrowserDim();
        this.Direct = y + height > size.h ? 1 : 0;
        this.Set({ Extend: !this.Extend, Refresh: true });

        if (this.Extend) {
            //console.log('close other');
            console.log(GSELECT.Data);

            for (let i = 0; i < GSELECT.Data.length; i++) {
                if (GSELECT.Data[i].Type === GSELECT.TYPE.DROP_DOWN && GSELECT.Data[i].ID !== this.ID) {
                    if (GSELECT.Data[i].Extend) { GSELECT.Data[i].Set({ Extend: false, Refresh: true }); }
                }
            }
        }

    };


}

function SSELECT_POPUP_CL(infoInit) {
    SSELECT_BASE_CL.call(this, infoInit);

    var _SSELECT_POPUP_CL = this;
    this.DIALOG = null;
    this.SELECT = null;

    this.Type = GSELECT.TYPE.POPUP;
    this.JElement.attr('data-t', this.Type);

    this.Html.Button = '<button type="button" onclick="GSELECT.Click(event,\'{1}\')" class="btn btn-default {2}"> \
                            <span id="lb-{1}">{0}</span>\
                        </button>';

    this.Render = function () {
        this.JElement.empty();
        var script = String.format(this.Html.Button, this.GetTextSelected(), this.ID);
        this.JElement.append(script);
    };

    this.Set = function (info) {
        this.Set_Base(info);
        if (info.Refresh === true) { this.Render(); }
    };
    this.Set(infoInit);

    this.Render();
    this.Click = function () {

        if (this.DIALOG === null) {

            var htmlTemp = '<div id="dia{0}" title="{1}">\
                                <div id="dias-{0}"><div>\
                            </div>';

            $("body").append(String.format(htmlTemp, this.ID, "SSELECT_POPUP_CL"));

            this.SELECT = new SSELECT_LIST_CL({
                Sender: "dias-" + this.ID,
                Items: this.Items,
                ChkALL: { Check: 0, Text: "Tat ca", Func: function (info) { } },
                Search: true,
                Height: "200px",
                Width: "100%"
            });


            this.DIALOG = DIALOG.show({
                title: 'Dialog',
                include: "dia" + this.ID,
                type: DIALOG.TYPE.DIALOG_S,
                id: this.ID,
                buttons: [
                    new ButtonCL({
                        html: "Apply", callback: function () {
                            _SSELECT_POPUP_CL.Set({ Items: _SSELECT_POPUP_CL.SELECT.Items, Refresh: true });
                        }
                    }),
                    new ButtonCL({ html: "Close", callback: function () { } }),
                ]
            });

        }

        var size = SUtil.GetBrowserDim();
        var height = Math.min(size.h, this.Size.height);

        this.SELECT.Set({ Items: this.Items, Refresh: true, Size: { width: "100%", height: (height - 120) + "px" } });
        this.DIALOG.open();
    };
}

function SSELECT_LIST_CL(infoInit) {
    SSELECT_BASE_CL.call(this, infoInit);

    this.DIALOG = null;
    this.Type = GSELECT.TYPE.LIST;
    this.JElement.attr('data-t', this.Type);


    this.Html.Button = '<div> \
                            <span id="lb-{1}">{0}<span> \
                        </div>';

    this.Html.DIV = '<section data-t="{1}" style="{2}" onclick="GSELECT.StopClick(event)"> \
                        {3}\
                        <div class="_lst" data-s="{4}"> \
                            <table> \
                                <tbody id="{0}"></tbody> \
                            </table> \
                        </div> \
                    </section>';

    this.Render = function () {
        this.JElement.empty();
        var script = String.format(this.Html.Button, this.GetTextSelected(), this.ID);
        this.JElement.append(script);

        var css = String.format("height: {0}; width: {1}", this.Size.height, this.Size.width);
        var htmlSearch = this.Search ? String.format(this.Html.Search, this.ID) : "";

        this.JElement.append(String.format(this.Html.DIV, this.ID, this.Type, css, htmlSearch, this.Search));
        var jSender = SUtil.J(this.ID);
        if (this.ChkALL !== null) { jSender.append(this.ChkALL.Render()); }
        for (var i = 0; i < this.Items.length; i++) { jSender.append(this.Items[i].Render()); }
    };

    this.Set = function (info) {
        this.Set_Base(info);
        if (info.Refresh === true) { this.Render(); }
    };
    this.Set(infoInit);

    this.Render();
}

function SRADIO_LIST_CL(infoInit) {
    SSELECT_BASE_CL.call(this, infoInit);

    this.Type = GSELECT.TYPE.LIST;
    this.Kind = GSELECT.KIND.RADIO;

    this.JElement.attr('data-t', this.Type);


    this.Html.Button = '<div style="display:none"> \
                            <span id="lb-{1}">{0}<span> \
                        </div>';

    this.Html.DIV = '<section data-t="{1}" style="{2}" onclick="GSELECT.StopClick(event)"> \
                        {3}\
                        <div class="_lst" data-s="{4}"> \
                            <table> \
                                <tbody id="{0}"></tbody> \
                            </table> \
                        </div> \
                    </section>';

    this.Render = function () {
        this.JElement.empty();
        var script = String.format(this.Html.Button, this.GetTextSelected(), this.ID);
        this.JElement.append(script);

        var css = String.format("height: {0}; width: {1}", this.Size.height, this.Size.width);
        var htmlSearch = this.Search ? String.format(this.Html.Search, this.ID) : "";

        this.JElement.append(String.format(this.Html.DIV, this.ID, this.Type, css, htmlSearch, this.Search));
        var jSender = SUtil.J(this.ID);
        for (var i = 0; i < this.Items.length; i++) { jSender.append(this.Items[i].Render()); }
    };
    this.Set = function (info) {
        this.Set_Base(info);
        for (var i = 0; i < this.Items.length; i++) {
            this.Items[i].Kind = GSELECT.KIND.RADIO;
        }
        if (info.Refresh === true) { this.Render(); }
    };
    this.Set(infoInit);
    this.Render();
}
//#endregion



//#region NOTICE

var ENoticeType = {
    Black: "son-notice-black",
    Light: "son-notice-light",
    Info: "son-notice-info",
    Warning: "son-notice-warning",
    Alert: "son-notice-alert",
    Success: "son-notice-success",
    MSAlert: "son-notice-alert-ms",
};

var ENoticePosition = {
    TopLeft: "topleft",
    TopRight: "topright",
    BottomLeft: "bottomleft",
    BottomRight: "bottomright",
    Center: "center",
};

var NoticeHTML = {

    DATA: [],

    find: function (ms) {
        for (var i = 0; i < this.DATA.length; i++) {
            if (this.DATA[i].ID === ms) {
                return this.DATA[i];
            }
        }
        return null;
    },

    push: function (obj) { this.DATA.push(obj); },

    WARNING: function (info) {
        info.duration = SUtil.Default(info.duration, 5000);
        info.type = SUtil.Default(info.type, ENoticeType.Warning);
        info.position = SUtil.Default(info.position, ENoticePosition.Center);
        info.closeBtn = SUtil.Default(info.closeBtn, true);
        info.iconFont = SUtil.Default(info.iconFont, '<i class="fa fa-exclamation-triangle"></i>');
        return NoticeHTML.Show(info);
    },

    Warning: function (info) {
        info.duration = SUtil.Default(info.duration, 5000);
        info.type = SUtil.Default(info.type, ENoticeType.Warning);
        info.position = SUtil.Default(info.position, ENoticePosition.BottomRight);
        info.iconFont = SUtil.Default(info.iconFont, '<i class="fa fa-exclamation-triangle"></i>');
        return NoticeHTML.Show(info);
    },

    SUCCESS: function (info) {
        info.duration = SUtil.Default(info.duration, 5000);
        info.type = SUtil.Default(info.type, ENoticeType.Success);
        info.position = SUtil.Default(info.position, ENoticePosition.Center);
        info.iconFont = SUtil.Default(info.iconFont, '<i class="fa fa-check-circle" aria-hidden="true"></i>');
        info.closeBtn = SUtil.Default(info.closeBtn, true);
        return NoticeHTML.Show(info);
    },

    Success: function (info) {
        info.duration = SUtil.Default(info.duration, 5000);
        info.type = SUtil.Default(info.type, ENoticeType.Success);
        info.position = SUtil.Default(info.position, ENoticePosition.BottomRight);
        info.iconFont = SUtil.Default(info.iconFont, '<i class="fa fa-check-circle" aria-hidden="true"></i>');
        return NoticeHTML.Show(info);
    },

    INFO: function (info) {
        info.duration = SUtil.Default(info.duration, 5000);
        info.type = SUtil.Default(info.type, ENoticeType.Info);
        info.position = SUtil.Default(info.position, ENoticePosition.Center);
        info.iconFont = SUtil.Default(info.iconFont, '<i class="fa fa-info" aria-hidden="true"></i>');
        info.closeBtn = SUtil.Default(info.closeBtn, true);
        return NoticeHTML.Show(info);
    },

    Info: function (info) {
        info.duration = SUtil.Default(info.duration, 5000);
        info.type = SUtil.Default(info.type, ENoticeType.Info);
        info.position = SUtil.Default(info.position, ENoticePosition.BottomRight);
        return NoticeHTML.Show(info);
    },

    Show: function (info) {

        //CHECK EXISITED
        var existed = this.DATA.find(x => x.message === info.msg);
        if (existed !== undefined && existed !== null) {
            return;
        }

        var notice = new NoticeCL(info);
        return notice;
    },

    Close: function (ms) {

        var notice = this.find(ms);
        if (notice === null) { return; }

        notice.Remove();

        for (var i = 0; i < this.DATA.length; i++) {
            if (this.DATA[i].ID === ms) {
                this.DATA.splice(i, 1);
                break;
            }
        }

    },

    MESSAGE: function (info) {
        info.duration = SUtil.Default(info.duration, 10000);
        info.type = SUtil.Default(info.type, ENoticeType.Light);
        info.iconFont = SUtil.Default(info.iconFont, '<i class="fa fa-exclamation-circle" aria-hidden="true"></i>');
        info.class = SUtil.Default(info.class, 'notice-msg');
        info.position = ENoticePosition.Center;
        info.closeBtn = SUtil.Default(info.closeBtn, true);
        return NoticeHTML.Show(info);
    },

    closeAfter: function (start, end, notice) {
        var now = new Date().getTime() - start;
        var per = now * 100 / end;

        if (per >= 100) {
            NoticeHTML.Close(notice.ID);
            return;
        }

        var senderDuration = document.getElementById("notice-dur-" + notice.ID);
        if (senderDuration !== undefined && senderDuration !== null) {
            senderDuration.style.width = parseInt(per) + "%";
            setTimeout(function () { NoticeHTML.closeAfter(start, end, notice); }, 50);
        } 
    }
};

function NoticeCL(infoInit) {
    this.message = SUtil.Default(infoInit.msg, "Empty");
    this.duration = SUtil.Default(infoInit.duration, 0);
    this.type = SUtil.Default(infoInit.type, ENoticeType.Info);
    this.position = SUtil.Default(infoInit.position, ENoticePosition.BottomRight);
    this.iconFont = SUtil.Default(infoInit.iconFont, "");
    this.ID = SUtil.AutoElementId();
    this.width = SUtil.Default(infoInit.width, "320px");
    this.height = SUtil.Default(infoInit.height, "");
    this.closeBtn = SUtil.Default(infoInit.closeBtn, false);
    this.class = SUtil.Default(infoInit.class, "");
    NoticeHTML.push(this);

    this.CreateHTML = function () {
        var htmlDuration = this.duration !== 0 ? String.format('<div class="son-notice-duration"> <div class="son-notice-bar" id="notice-dur-{0}" data-p={0}></div> </div>', this.ID) : "";
        var htmlContent = "";
        if (this.iconFont !== "") {
            var html_Content = '<table role="iconfont" class="icon-font">\
                                    <tr>\
                                        <td>{0}</td>\
                                        <td>{1}</td>\
                                    </tr>\
                                </table>';
            htmlContent = String.format(html_Content, this.iconFont, this.message);
        }
        else {
            htmlContent = this.message;
        }

        var htmlBtnClose = "";
        if (this.closeBtn) {
            htmlBtnClose = '<div class="_divBtn"><button onclick="NoticeHTML.Close(\'{0}\')" type="button">{1}</button></div>';
            htmlBtnClose = String.format(htmlBtnClose, this.ID, LNG.GetValue("button", "ok", "OK"));
        }

        var html_notice = '<div class="son-notice {0} {5}" id="{2}">\
                                <i onclick="NoticeHTML.Close(\'{2}\')" class="notice-close">&times;</i>\
                                <div class="son-notice-content">{1}</div>\
                                {3}\
                                {4}\
                            </div>';

        var script = String.format(html_notice, this.type, htmlContent, this.ID, htmlDuration, htmlBtnClose, this.class);

        var containerNotice = document.getElementsByTagName('body')[0];
        var senderNotice = null;

        var nodeDiv = document.createElement("div");
        nodeDiv.setAttribute("class", "notice-container");

        switch (this.position) {
            case ENoticePosition.TopLeft:
                {
                    senderNotice = document.getElementById('notice-topleft');
                    if (senderNotice === null) {
                        //containerNotice.innerHTML += "<div class='notice-container' id='notice-topleft'></div>";
                        nodeDiv.setAttribute("id", "notice-topleft");
                        containerNotice.appendChild(nodeDiv);
                        senderNotice = document.getElementById('notice-topleft');
                    }
                    break;
                }
            case ENoticePosition.TopRight:
                {
                    senderNotice = document.getElementById('notice-topright');
                    if (senderNotice === null) {
                        //containerNotice.innerHTML += "<div class='notice-container' id='notice-topright'></div>";
                        nodeDiv.setAttribute("id", "notice-topright");
                        containerNotice.appendChild(nodeDiv);
                        senderNotice = document.getElementById('notice-topright');
                    }
                    break;
                }
            case ENoticePosition.BottomLeft:
                {
                    senderNotice = document.getElementById('notice-bottomleft');
                    if (senderNotice === null) {
                        //containerNotice.innerHTML += "<div class='notice-container' id='notice-bottomleft'></div>";
                        nodeDiv.setAttribute("id", "notice-bottomleft");
                        containerNotice.appendChild(nodeDiv);
                        senderNotice = document.getElementById('notice-bottomleft');
                    }
                    break;
                }
            case ENoticePosition.BottomRight:
                {
                    senderNotice = document.getElementById('notice-bottomright');
                    if (senderNotice === null) {
                        //containerNotice.innerHTML += '<div class="notice-container" id="notice-bottomright"></div>';
                        nodeDiv.setAttribute("id", "notice-bottomright");
                        containerNotice.appendChild(nodeDiv);
                        senderNotice = document.getElementById('notice-bottomright');
                    }
                    break;
                }
            case ENoticePosition.Center:
                {
                    //containerNotice.innerHTML += String.format("<div class='notice-container notice-center' id='notice-center-{0}'></div>", this.ID);
                    nodeDiv.setAttribute("class", "notice-container notice-center");
                    nodeDiv.setAttribute("id", "notice-center-" + this.ID);
                    containerNotice.appendChild(nodeDiv);
                    senderNotice = document.getElementById("notice-center-" + this.ID);
                    break;
                }
            default: return;
        }

        senderNotice.innerHTML += script;

        var senderObj = document.getElementById(this.ID);

        if (this.width !== "") { senderObj.style.width = this.width; }
        if (this.height !== "") { senderObj.style.height = this.height; }
        if (this.duration === 0) { return; }

        NoticeHTML.closeAfter(new Date().getTime(), this.duration, this);
    };
    this.CreateHTML();
    this.Remove = function () {
        var elem = document.getElementById(this.ID);
        var parentNode = elem.parentNode;
        parentNode.removeChild(elem);
        if (parentNode.classList.contains('notice-center')) {
            parentNode.parentNode.removeChild(parentNode);
        }
    };
}
//#endregion

/**
* Convert From/To Binary/Decimal/Hexadecimal in JavaScript
* https://gist.github.com/faisalman
*
* Copyright 2012-2015, Faisalman <fyzlman@gmail.com>
* Licensed under The MIT License
* http://www.opensource.org/licenses/mit-license
*/

(function () {

    var NumberConvert = function (num) {
        return {
            from: function (baseFrom) {
                return {
                    to: function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
                    }
                };
            }
        };
    };

    // binary to decimal
    NumberConvert.bin2dec = function (num) {
        return NumberConvert(num).from(2).to(10);
    };

    // binary to hexadecimal
    NumberConvert.bin2hex = function (num) {
        return NumberConvert(num).from(2).to(16);
    };

    // decimal to binary
    NumberConvert.dec2bin = function (num) {
        return NumberConvert(num).from(10).to(2);
    };

    // decimal to hexadecimal
    NumberConvert.dec2hex = function (num) {
        return NumberConvert(num).from(10).to(16);
    };

    // hexadecimal to binary
    NumberConvert.hex2bin = function (num) {
        return NumberConvert(num).from(16).to(2);
    };

    // hexadecimal to decimal
    NumberConvert.hex2dec = function (num) {
        return NumberConvert(num).from(16).to(10);
    };

    this.ConvertBase = NumberConvert;

})(this);

/*
* Usage example:
* ConvertBase.bin2dec('111'); // '7'
* ConvertBase.dec2hex('42'); // '2a'
* ConvertBase.hex2bin('f8'); // '11111000'
* ConvertBase.dec2bin('22'); // '10110'
*/

function PagingCL(initInfo) {

    this.parentId = SUtil.Default(initInfo.parentId, '');
    this.id = SUtil.Default(initInfo.id, SUtil.AutoElementId());

    this.pageSize = 50;
    this.pageIndex = 1;
    this.totalRecord = 0;
    this.totalPage = 0;
    this.morePage = false;
    this.onChange = null;

    this.set = function (info) {
        if (info.pageSize !== undefined) { this.pageSize = info.pageSize; }
        if (info.onChange !== undefined) { this.onChange = info.onChange; }
        if (info.totalRecord !== undefined) {
            this.totalRecord = info.totalRecord;

            //CACL TOTAL PAGE
            this.totalPage = parseInt(this.totalRecord / this.pageSize);
            if (this.pageSize * this.totalPage < this.totalRecord) {
                this.totalPage++;
            }
            this.pageIndex = Math.min(this.totalPage, this.pageIndex);
            this.pageIndex = Math.max(1, this.pageIndex);
        }
        this.createHtml();
    }

    this.createHtml = function () {

        if (this.totalRecord === 0) {
            document.getElementById(this.parentId).innerHTML = '';
            return;
        }

        var html_pageSize = '';
        var list = [5, 10, 25, 50, 100];

        for (let i = 0; i < list.length; i++) {
            html_pageSize += `<option value="${list[i]}"  ${this.pageSize == list[i] ? 'selected' : ''}>${list[i]}</option>`;
        }


        var html = `
            <div class="paging">
                <table>
                    <tr>
                        <td data-role="text" style="text-align: left; min-width:100px">Page <span>${this.pageIndex} of ${this.totalPage}</span>
                        </td>
                        <td data-role="btns">
                            <i class="fas fa-caret-square-left" data-enable="${this.pageIndex > 1 ? 1 : 0}" onclick="PAGING.next('${this.id}', -1)"></i>
                            <i class="fas fa-caret-square-right"  data-enable="${this.pageIndex < this.totalPage ? 1 : 0}"  onclick="PAGING.next('${this.id}', 1)"></i>
                        </td>
                        <td>&nbsp</td>
                        <td style="text-align: right">Go To Page</td>
                        <td data-role="input">
                            <input type="number" min="1" max="${this.totalPage}" class="form-control form-control-sm son-textbox" id="${this.id}_txtGoto" onkeypress="return InputValidate.IsInteger(event);"/>
                        </td>
                        <td data-role="btns" style="width: 55px">
                            <i class="fas fa-caret-square-right" onclick="PAGING.gotoPage('${this.id}')"></i>
                        </td>

                        <td style="text-align: right">Records Per Page</td>
                        <td data-role="input">
                            <select style="margin: 0px 0px 0px auto" class="form-control form-control-sm son-textbox" onchange="PAGING.changePageSize(this, '${this.id}')">
                               ${html_pageSize}
                            </select>
                        </td>

                    </tr>
                </table>
            </div>
        `;


        document.getElementById(this.parentId).innerHTML = html;

    }
    //this.createHtml();


    this.goto = function (index) {

        index = SUtil.HandleMaxMin(index, 1, this.totalPage);

        if (this.pageIndex === index)
            return;

        if (index < 1)
            return;

        this.pageIndex = index;


        console.log('goto: ' + this.pageIndex);

        if (this.onChange !== null)
            this.onChange(this.pageIndex);

        this.createHtml();
    };

    this.set(initInfo);
    PAGING.data.push(this);

    this.next = function (unit) {
        var pageIndex = this.pageIndex + unit;
        this.goto(pageIndex);
    };

    this.changePageSize = function (pageSize) {

        this.pageIndex = 1;
        this.pageSize = pageSize;

        //RE CACL TOTAL PAGE
        this.totalPage = parseInt(this.totalRecord / this.pageSize);
        if (this.pageSize * this.totalPage < this.totalRecord) {
            this.totalPage++;
        }

        console.log('changePageSize: ' + this.pageIndex);

        if (this.onChange !== null)
            this.onChange(this.pageIndex);

        this.createHtml();

    }

    this.oldPageIndex = 0;
    this.gotoPage = function () {
        var page = document.getElementById(this.id + '_txtGoto').value;
        if (page.trim() === '') return;

        this.oldPageIndex = this.pageIndex;
        this.goto(parseInt(page));
    }

    this.back = function () {
        this.pageIndex = this.oldPageIndex;
        this.createHtml();
    }

}

var PAGING = {
    data: [],
    find: function (id) {
        return this.data.find(x => x.id === id);
    },

    next: function (id, unit) {
        var obj = this.find(id);
        obj.next(unit);
    },

    changePageSize: function (sender, id) {
        var pageSize = parseInt(sender.value);
        var obj = this.find(id);
        obj.changePageSize(pageSize);
    },

    gotoPage: function (id) {
        var obj = this.find(id);
        obj.gotoPage();
    }
}


//#region Slide Number S1
function SliderNumberS1(infoInit) {
    //#region Property
    this.Slide = null;
    this.Unit = infoInit.unit || 1;
    this.Value = infoInit.defaultValue || 0;
    this.Min = infoInit.min || 0;
    this.Max = infoInit.max || 0;
    this.ID = SUtil.GetRadomKeyPlus("rslider");
    this.ElementID = infoInit.element || 'body';
    this.JElement = SUtil.J(this.ElementID);

    this.JElement.addClass('SliderNumberS1');

    this.JLable = null;
    var _SliderNumberS = this;
    //#endregion
    //#region Event
    this.OnSlide = null;
    this.OnStop = null;
    this.OnPlus = null;
    //#endregion
    this.Slide = this.JElement.slider({
        animate: true,
        range: "min",
        value: this.Value,
        min: this.Min,
        max: this.Max,
        create: function (event, ui) {
            var sender = _SliderNumberS.JElement.find('span').first();
            var html = '<i class="fa fa-angle-left btn-slider" aria-hidden="true"></i> <span id="lableSlider{0}">{1}</span> <i class="fa fa-angle-right btn-slider" aria-hidden="true"></i>';
            var script = String.format(html, _SliderNumberS.ID, _SliderNumberS.Value);
            sender.html(script);
            _SliderNumberS.JLable = $("#lableSlider" + _SliderNumberS.ID);

            var btns = sender.find('i');
            $(btns[0]).click(function () {
                _SliderNumberS.PlusValue(-1 * _SliderNumberS.Unit);
            });
            $(btns[1]).click(function () {
                _SliderNumberS.PlusValue(_SliderNumberS.Unit);
            });
        },
        slide: function (event, ui) {
            _SliderNumberS.RangeValue(ui.value);
            if (_SliderNumberS.OnSlide !== null) {
                _SliderNumberS.OnSlide(_SliderNumberS.Value);
            }
        },
        stop: function (event, ui) {
            _SliderNumberS.RangeValue(ui.value);
            if (_SliderNumberS.OnStop !== null) {
                _SliderNumberS.OnStop(_SliderNumberS.Value);
            }
        }
    });
    this.RangeValue = function (value) {
        value = parseInt(value);
        value = value > this.Max ? this.Max : value;
        value = value < this.Min ? this.Min : value;
        this.Value = value;
        if (this.JLable !== null) { this.JLable.text(this.Value); }
    };
    this.Set = function (info) {
        if (info.value !== undefined) {
            this.RangeValue(value);
            this.Slide.slider('value', this.Value);
        }
    };
    this.PlusValue = function (unit) {
        var value = this.Value + unit;
        this.RangeValue(value);
        this.Slide.slider('value', this.Value);
        if (this.OnPlus !== null) { this.OnPlus(this.Value); }
    };
}
//#endregion

//#region  Slide Number S2
function SliderNumberS2(infoInit) {
    //#region Property
    this.Unit = infoInit.unit || 1;
    this.Value = infoInit.defaultValue || 0;
    this.Min = infoInit.min || 0;
    this.Max = infoInit.max || 0;
    this.ID = SUtil.GetRadomKeyPlus("rslider");
    this.ElementID = infoInit.element || 'body';
    this.JElement = SUtil.J(this.ElementID);
    this.JLable = null;
    this.NameUnit = infoInit.nameOfUnit || "";
    this.LabelClass = infoInit.labelclass || "";
    this.NameOfSlide = infoInit.name || "";
    var _SliderNumberS = this;
    //#endregion

    //#region Event
    this.OnSlide = null;
    this.OnStop = null;
    this.OnPlus = null;
    this.OnChangeValue = null;
    //#endregion

    //#region Create
    this.JElement.addClass('SliderNumberS2');

    var htmlName = this.NameOfSlide.length > 0 ? '<td data-role="name"> ' + this.NameOfSlide + '  </td>' : "";
    var htmlCode = '<table>\
                        <tr>\
                            {4}\
                            <td data-role="btnF"><i data-role="btnDe" class="fa fa-minus" aria-hidden="true"></i></td>\
                            <td data-role="slide"><div id="{0}"></div></td>\
                            <td data-role="btnE"><i data-role="btnIn" class="fa fa-plus" aria-hidden="true"></i></td>\
                            <td data-role="label" class="{2}"> <span data-role="label">{3}</span> {1} </td>\
                        </tr>\
                    </table>';

    var mScript = String.format(htmlCode, this.ID, this.NameUnit, this.LabelClass, this.Value, htmlName);
    this.JElement.html(mScript);
    this.JSender = SUtil.J(this.ID);

    this.JLable = this.JElement.find("span[data-role='label']").first();
    this.JElement.find("td[data-role='btnF']").first().click(function () { _SliderNumberS.PlusValue(-1 * _SliderNumberS.Unit); });
    this.JElement.find("td[data-role='btnE']").first().click(function () { _SliderNumberS.PlusValue(_SliderNumberS.Unit); });

    this.Slide = this.JSender.slider({
        animate: true,
        range: "min",
        value: this.Value,
        min: this.Min,
        max: this.Max,
        create: function (event, ui) { },
        slide: function (event, ui) {
            _SliderNumberS.RangeValue(ui.value);
            if (_SliderNumberS.OnSlide !== null) { _SliderNumberS.OnSlide(_SliderNumberS.Value); }
            if (_SliderNumberS.OnChangeValue !== null) { _SliderNumberS.OnChangeValue(_SliderNumberS.Value); }

        },
        stop: function (event, ui) {
            _SliderNumberS.RangeValue(ui.value);
            if (_SliderNumberS.OnStop !== null) { _SliderNumberS.OnStop(_SliderNumberS.Value); }
        }
    });
    this.RangeValue = function (value) {
        value = parseInt(value);
        value = value > this.Max ? this.Max : value;
        value = value < this.Min ? this.Min : value;
        this.Value = value;
        if (this.JLable !== null) { this.JLable.text(this.Value); }
    };

    this.PlusValue = function (unit) {
        var value = this.Value + unit;
        this.RangeValue(value);
        this.Slide.slider('value', this.Value);
        if (this.OnPlus !== null) { this.OnPlus(this.Value); }

        if (this.OnChangeValue !== null) { this.OnChangeValue(this.Value); }
    };

    //#endregion

    //#region Set vs Get
    this.Set = function (info) {
        if (info.value !== undefined) {
            this.RangeValue(info.value);
            this.Slide.slider('value', this.Value);
            if (this.OnChangeValue !== null) {
                this.OnChangeValue(this.Value);
            }
        }
    };
    this.Get = function () {
        return { value: this.Value };
    };
    //#endregion

}

//#endregion
//------------------------------------------------------------
//#region Slider Number Vertivcal

function SliderNumberV(infoInit) {
    //#region Property
    this.Unit = infoInit.unit || 1;
    this.Value = infoInit.defaultValue || 0;
    this.Min = infoInit.min || 0;
    this.Max = infoInit.max || 0;
    this.ID = SUtil.GetRadomKeyPlus("rslider");
    this.ElementID = infoInit.element || 'body';
    this.JElement = SUtil.J(this.ElementID);
    this.JLable = null;
    this.NameUnit = infoInit.nameOfUnit || "";
    this.LabelClass = infoInit.labelclass || "";
    this.NameOfSlide = infoInit.name || "";
    this.HeightOfSlider = infoInit.height || 100;
    var _SliderNumberS = this;
    //#endregion

    //#region Event
    this.OnSlide = null;
    this.OnStop = null;
    this.OnPlus = null;
    this.OnChangeValue = null;
    //#endregion

    //#region Create
    this.JElement.addClass('SliderNumberV');

    var htmlName = this.NameOfSlide.length > 0 ? '<td data-role="name"> ' + this.NameOfSlide + '  </td>' : "";
    var htmlCode = '<table>\
                        <tr>{4}</tr>\
                        <tr><td data-role="btnE"><i data-role="btnIn" class="fa fa-chevron-up" aria-hidden="true"></i></td></tr>\
                        <tr><td data-role="slide"><div id="{0}" style="height:{5}px"></div></td><tr>\
                        <tr><td data-role="btnF"><i data-role="btnDe" class="fa fa-chevron-down" aria-hidden="true"></i></td></tr>\
                        <tr><td data-role="label" class="{2}"> <span data-role="label">{3}</span> {1} </td></tr>\
                    </table>';

    var mScript = String.format(htmlCode, this.ID, this.NameUnit, this.LabelClass, this.Value, htmlName, this.HeightOfSlider);
    this.JElement.html(mScript);
    this.JSender = SUtil.J(this.ID);

    this.JLable = this.JElement.find("span[data-role='label']").first();
    this.JElement.find("td[data-role='btnF']").first().click(function () { _SliderNumberS.PlusValue(-1 * _SliderNumberS.Unit); });
    this.JElement.find("td[data-role='btnE']").first().click(function () { _SliderNumberS.PlusValue(_SliderNumberS.Unit); });

    this.Slide = this.JSender.slider({
        animate: true,
        range: "min",
        value: this.Value,
        min: this.Min,
        max: this.Max,
        orientation: "vertical",
        create: function (event, ui) { },
        slide: function (event, ui) {
            _SliderNumberS.RangeValue(ui.value);
            if (_SliderNumberS.OnSlide !== null) { _SliderNumberS.OnSlide(_SliderNumberS.Value); }
            if (_SliderNumberS.OnChangeValue !== null) { _SliderNumberS.OnChangeValue(_SliderNumberS.Value); }
        },
        stop: function (event, ui) {
            _SliderNumberS.RangeValue(ui.value);
            if (_SliderNumberS.OnStop !== null) { _SliderNumberS.OnStop(_SliderNumberS.Value); }
        }
    });
    this.RangeValue = function (value) {
        value = parseInt(value);
        value = value > this.Max ? this.Max : value;
        value = value < this.Min ? this.Min : value;
        this.Value = value;
        if (this.JLable !== null) { this.JLable.text(this.Value); }
    };

    this.PlusValue = function (unit) {
        var value = this.Value + unit;
        this.RangeValue(value);
        this.Slide.slider('value', this.Value);
        if (this.OnPlus !== null) { this.OnPlus(this.Value); }

        if (this.OnChangeValue !== null) { this.OnChangeValue(this.Value); }
    };
    //#endregion

    //#region Set vs Get
    this.Set = function (info) {
        if (info.value !== undefined) {
            this.RangeValue(info.value);
            this.Slide.slider('value', this.Value);
            if (this.OnChangeValue !== null) {
                this.OnChangeValue(this.Value);
            }
        }
    };

    this.Get = function () {
        return { value: this.Value };
    };
    //#endregion

}

//#endregion


var FormatDate = "dd/MM/yyyy";

var TimeUtil = {
    ParseDate: function (jsonDateTime) {
        try {
            var re = /-?\d+/;
            var m = re.exec(jsonDateTime);
            var date = new Date(parseInt(m[0]));
            return date;
        }
        catch (e) { return ""; }
    },
    TicksToDateLocal: function (ticks) {
        try {
            var tick = parseInt(ticks);
            tick = tick - 621355968000000000;
            var ticksToMicrotime = tick / 10000;
            var tickDate = new Date(ticksToMicrotime);
            return tickDate;
        }
        catch (e) {
            return "";
        }
    },
    TicksToStringLocal: function (ticks) {
        try {
            var tick = parseInt(ticks);
            tick = tick - 621355968000000000;
            var ticksToMicrotime = tick / 10000;
            var tickDate = new Date(ticksToMicrotime);
            return tickDate.toString(FormatDate + " HH:mm:ss");
        }
        catch (e) {
            return "";
        }
    },
    TicksToStringDateLocal: function (ticks) {
        try {
            //console.log(FormatDate);

            if (ticks === undefined || ticks === 0) return "";

            var tick = parseInt(ticks);
            tick = tick - 621355968000000000;
            var ticksToMicrotime = tick / 10000;
            var tickDate = new Date(ticksToMicrotime);
            return tickDate.toStringNCIC(FormatDate);
        }
        catch (e) {
            return "";
        }
    },
    TicksToStringTimeLocal: function (ticks) {
        try {
            var tick = parseInt(ticks);
            tick = tick - 621355968000000000;
            var ticksToMicrotime = tick / 10000;
            var tickDate = new Date(ticksToMicrotime);
            return tickDate.toString("HH:mm:ss");
        }
        catch (e) {
            return "";
        }
    },
    BootrapPickerValueToDate: function (mdate) {
        try {
            var array1 = mdate.split('/');
            var array2 = array1[2].split(' ');
            var array3 = array2[1].split(':');
            var ms = "";

            var formatTime = FormatDate.toLowerCase();

            var tempDate = "{0}/{1}/{2}";
            var tempTime = " {0}:{1}:{2}";

            if (formatTime === "mm/dd/yyyy") { ms = String.format(tempDate, array1[0], array1[1], array2[0]); }
            else if (formatTime === "dd/mm/yyyy") { ms = String.format(tempDate, array1[1], array1[0], array2[0]); }
            else if (formatTime === "yyyy/mm/dd") { ms = String.format(tempDate, array1[1], array2[0], array1[0]); }
            else if (formatTime === "yyyy/dd/mm") { ms = String.format(tempDate, array2[0], array1[1], array1[0]); }
            else { ms = String.format(tempDate, array1[0], array1[1], array2[0]); }

            ms += String.format(tempTime, array3[0], array3[1], array3[2]);
            return Date.parse(ms);
        }
        catch (e) {
            return null;
        }
    },

    //Format DateInt64: VD: 20181227101210
    LeftPad: function (number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    },
    DateToTextNumber: function (objDate) {
        var year = this.LeftPad(objDate.getFullYear(), 4);
        var month = this.LeftPad(objDate.getMonth() + 1, 2);
        var date = this.LeftPad(objDate.getDate(), 2);
        var hour = this.LeftPad(objDate.getHours(), 2);
        var minute = this.LeftPad(objDate.getMinutes(), 2);
        var second = this.LeftPad(objDate.getSeconds(), 2);
        return year + month + date + hour + minute + second;
    },
    DateToTextNumberUTC: function (objDate) {
        var year = this.LeftPad(objDate.getUTCFullYear(), 4);
        var month = this.LeftPad(objDate.getUTCMonth() + 1, 2);
        var date = this.LeftPad(objDate.getUTCDate(), 2);
        var hour = this.LeftPad(objDate.getUTCHours(), 2);
        var minute = this.LeftPad(objDate.getUTCMinutes(), 2);
        var second = this.LeftPad(objDate.getUTCSeconds(), 2);
        return year + month + date + hour + minute + second;
    },
    TextNumberToDateLocal: function (number, utc) {
        var lvalue = parseInt(number);
        if (lvalue <= 0) return new Date(0, 0, 0);
        var year = lvalue / 10000000000;
        var month = (lvalue % 10000000000) / 100000000;
        var date = (lvalue % 100000000) / 1000000;
        var hour = (lvalue % 1000000) / 10000;
        var minute = (lvalue % 10000) / 100;
        var second = lvalue % 100;
        if (utc === true) {
            return new Date(Date.UTC(year, month - 1, date, hour, minute, second));
        }
        else {
            return new Date(year, month - 1, date, hour, minute, second);
        }
    },
    DateToTextFormat: function (objDate, format) {


        if (format === undefined) { format = FormatDate.toLowerCase(); }
        else { format = format.toLowerCase(); }


        var tempDate = "{0}/{1}/{2}";
        var tempTime = " {0}:{1}:{2}";

        var formats = format.split(' ');
        var formatDate = formats[0];
        var formatTime = '';

        if (formats.length > 1) formatTime = formats[1];

        var year = this.LeftPad(objDate.getFullYear(), 4);
        var month = this.LeftPad(objDate.getMonth() + 1, 2);
        var date = this.LeftPad(objDate.getDate(), 2);
        var hour = this.LeftPad(objDate.getHours(), 2);
        var minute = this.LeftPad(objDate.getMinutes(), 2);
        var second = this.LeftPad(objDate.getSeconds(), 2);

        if (formatDate === "mm/dd/yyyy") { ms = String.format(tempDate, month, date, year); }
        else if (formatDate === "dd/mm/yyyy") { ms = String.format(tempDate, date, month, year); }
        else if (formatDate === "yyyy/mm/dd") { ms = String.format(tempDate, year, month, date); }
        else if (formatDate === "yyyy/dd/mm") { ms = String.format(tempDate, year, date, month); }
        else { ms = String.format(tempDate, month, date, year); }

        if (formatTime.length > 0) {
            ms += String.format(tempTime, hour, minute, second);
        }

        return ms;
    },
    TextFormatToDate: function (mdate, format) {

        try {
            if (format === undefined) { format = FormatDate.toLowerCase(); }
            else { format = format.toLowerCase(); }

            let formats = format.split(' ');

            let formatDate = formats[0];
            let formatTime = formats.length > 1 ? formats[1] : '';



            var array = mdate.split(' ');

            var array1 = array[0].split('/');
            formatTime = formatTime.toLowerCase();
            var year = 0, month = 0, date = 0;
            if (formatDate === "dd/mm/yyyy") { date = array1[0]; month = array1[1]; year = array1[2]; }
            else if (formatDate === "yyyy/mm/dd") { date = array1[2]; month = array1[1]; year = array1[0]; }
            else if (formatDate === "yyyy/dd/mm") { date = array1[1]; month = array1[2]; year = array1[0]; }
            else { date = array1[1]; month = array1[0]; year = array1[2]; }// "mm/dd/yyyy"

            var hours = 0, minutes = 0, seconds = 0;
            if (formatTime.length > 0) {

                var array2 = array[1].split(':');

                hours = parseInt(array2[0]);
                minutes = parseInt(array2[1]);
                seconds = parseInt(array2[2]);
            }

            return new Date(parseInt(year), parseInt(month) - 1, parseInt(date), hours, minutes, seconds);
        }
        catch (e) {
            return null;
        }
    },

    DateToTextYYYMMDD: function (date) {
        var text = String.format('{0}-{1}-{2}',
            TimeUtil.LeftPad(date.getUTCFullYear(), 4),
            TimeUtil.LeftPad(date.getMonth() + 1, 2),
            TimeUtil.LeftPad(date.getDate(), 2));
        return text;
    },

    secondsToTimeString: function (seconds, strFormat) {
        if (strFormat == undefined) { strFormat = '{0}:{1}:{2}'; }
        var date = new Date(seconds * 1000);
        var dates = date.getUTCDate() - 1;
        var hours = date.getUTCHours();
        var minutes = date.getUTCMinutes();
        var seconds = date.getSeconds();
        var strTime = String.format(strFormat, this.LeftPad(hours, 2), this.LeftPad(minutes, 2), this.LeftPad(seconds, 2));
        if (dates > 0) { strTime = dates + ' day(s) ' + strTime; }
        return strTime;
    },

    //#region NEW
    textToDate: function (strDate, format = "mm/dd/yyyy hh:mm:ss", _delimiter = '/') {
        //Replace: TextFormatToDate
        try {

            format = format.toLowerCase();

            var formats = format.split(' ');
            var parts = strDate.split(' ');

            function stringToDate(_date, _format_date, _delimiter = '/') {
                try {
                    var formatLowerCase = _format_date.toLowerCase();
                    var formatItems = formatLowerCase.split(_delimiter);
                    var dateItems = _date.split(_delimiter);

                    var monthIndex = formatItems.indexOf("mm");
                    var dayIndex = formatItems.indexOf("dd");
                    var yearIndex = formatItems.indexOf("yyyy");

                    function normalNumber(number) {
                        number = parseInt(number);
                        if (number < 0)
                            number = 0;
                        if (Number.isNaN(number)) {
                            number = 0;
                        }
                        return number;
                    }

                    var year = yearIndex >= 0 ? normalNumber(dateItems[yearIndex]) : 0;
                    var month = monthIndex >= 0 ? normalNumber(dateItems[monthIndex]) - 1 : 0;
                    var date = dayIndex >= 0 ? normalNumber(dateItems[dayIndex]) : 0;

                    return { year: year, month: month, date: date };
                } catch (e) {
                    return { year: 0, month: 0, date: 0 };
                }
            }

            function stringToTime(_time, _format_time, _delimiter = ':') {

                try {
                    var formatLowerCase = _format_time.toLowerCase();
                    var formatItems = formatLowerCase.split(_delimiter);
                    var dateItems = _time.split(_delimiter);

                    var hourIndex = formatItems.indexOf("hh");
                    var minuteIndex = formatItems.indexOf("mm");
                    var secondIndex = formatItems.indexOf("ss");

                    function normalNumber(number) {
                        number = parseInt(number);
                        if (number < 0)
                            number = 0;
                        if (Number.isNaN(number)) {
                            number = 0;
                        }
                        return number;
                    }

                    var hours = hourIndex >= 0 ? normalNumber(dateItems[hourIndex]) : 0;
                    var minutes = minuteIndex >= 0 ? normalNumber(dateItems[minuteIndex]) : 0;
                    var seconds = secondIndex >= 0 ? normalNumber(dateItems[secondIndex]) : 0;

                    return { hours: hours, minutes: minutes, seconds: seconds };
                } catch (e) {
                    return { hours: 0, minutes: 0, seconds: 0 };
                }
            }

            var objDate = { year: 0, month: 0, date: 0 };
            var objTime = { hours: 0, minutes: 0, seconds: 0 };

            if (formats.length === 1) {
                //Date or Time
                if (format.indexOf('ss') >= 0 || format.indexOf('hh') >= 0) {
                    objTime = stringToTime(parts[0], formats[0]); //TIME
                    objDate = { year: 1901, month: 1, date: 1 };
                }
                else {
                    objDate = stringToDate(parts[0], formats[0]); //DATE
                }
            }

            if (formats.length > 1) {
                objDate = stringToDate(parts[0], formats[0]);
                objTime = stringToTime(parts[1], formats[1]);
            }

            return new Date(objDate.year, objDate.month, objDate.date, objTime.hours, objTime.minutes, objTime.seconds);

        } catch (e) {
            return null;
        }
    },
    dateToText: function (date, format = "mm/dd/yyyy hh:mm:ss", _delimiter = '/') {

        try {

            format = format.toLowerCase();

            function toTimeString(date, _formatTime, _delimiter = ':') {

                try {
                    var formatItems = _formatTime.split(_delimiter);

                    var hourIndex = formatItems.indexOf("hh");
                    var minuteIndex = formatItems.indexOf("mm");
                    var secondIndex = formatItems.indexOf("ss");

                    let numbers = [];
                    if (hourIndex >= 0) { numbers.push(date.getHours()) }
                    if (minuteIndex >= 0) { numbers.push(date.getMinutes()) }
                    if (secondIndex >= 0) { numbers.push(date.getSeconds()) }

                    let text = '';
                    for (let i = 0; i < numbers.length; i++) { text += TimeUtil.LeftPad(numbers[i], 2) + ':'; }
                    if (text.length > 0) { text = text.substring(0, text.length - 1); }

                    return text;

                } catch (e) {
                    return '';
                }

            }
            function toDateString(date, _formatDate, _delimiter = '/') {

                try {
                    var formatItems = _formatDate.split(_delimiter);

                    var yearIndex = formatItems.indexOf("yyyy");
                    var monthIndex = formatItems.indexOf("mm");
                    var dateIndex = formatItems.indexOf("dd");

                    let numbers = [
                        { index: yearIndex, name: 'yyyy' },
                        { index: monthIndex, name: 'mm' },
                        { index: dateIndex, name: 'dd' },
                    ];

                    numbers.sort((a, b) => {
                        if (a.index < b.index) {
                            return -1;
                        }
                        if (a.index > b.index) {
                            return 1;
                        }
                        return 0;
                    });

                    let text = '';
                    for (let i = 0; i < numbers.length; i++) {

                        if (numbers.index < 0)
                            continue;

                        switch (numbers[i].name) {
                            case 'yyyy': {
                                text += TimeUtil.LeftPad(date.getFullYear(), 4) + _delimiter;
                                break;

                            }
                            case 'mm': {
                                text += TimeUtil.LeftPad(date.getMonth() + 1, 2) + _delimiter;
                                break;
                            }
                            case 'dd': {
                                text += TimeUtil.LeftPad(date.getDate(), 2) + _delimiter;
                                break;
                            }
                        }
                    }

                    if (text.length > 0) { text = text.substring(0, text.length - 1); }
                    return text;

                } catch (e) {
                    return '';
                }
            }

            var formats = format.split(' ');

            if (formats.length == 1) {
                if (format.indexOf('ss') >= 0 || format.indexOf('hh') >= 0) {
                    return toTimeString(date, formats[0]); //TIME
                }
                else {
                    return toDateString(date, formats[0]); //DATE
                }
            }
            else {
                return toDateString(date, formats[0]) + ' ' + toTimeString(date, formats[1]);
            }
        } catch (e) {
            return '';
        }

    },
    dateToTextNumber: function (objDate, utc = false) {
        if (utc) {
            var year = this.LeftPad(objDate.getUTCFullYear(), 4);
            var month = this.LeftPad(objDate.getUTCMonth() + 1, 2);
            var date = this.LeftPad(objDate.getUTCDate(), 2);
            var hour = this.LeftPad(objDate.getUTCHours(), 2);
            var minute = this.LeftPad(objDate.getUTCMinutes(), 2);
            var second = this.LeftPad(objDate.getUTCSeconds(), 2);
            return year + month + date + hour + minute + second;
        }
        else {
            var year = this.LeftPad(objDate.getFullYear(), 4);
            var month = this.LeftPad(objDate.getMonth() + 1, 2);
            var date = this.LeftPad(objDate.getDate(), 2);
            var hour = this.LeftPad(objDate.getHours(), 2);
            var minute = this.LeftPad(objDate.getMinutes(), 2);
            var second = this.LeftPad(objDate.getSeconds(), 2);
            return year + month + date + hour + minute + second;
        }
    },
    textNumberToDate: function (number, utc = false) {
        var lvalue = parseInt(number);
        if (lvalue <= 0) return new Date(0, 0, 0);
        var year = lvalue / 10000000000;
        var month = (lvalue % 10000000000) / 100000000;
        var date = (lvalue % 100000000) / 1000000;
        var hour = (lvalue % 1000000) / 10000;
        var minute = (lvalue % 10000) / 100;
        var second = lvalue % 100;
        if (utc === true) {
            return new Date(Date.UTC(year, month - 1, date, hour, minute, second));
        }
        else {
            return new Date(year, month - 1, date, hour, minute, second);
        }
    },
    //#endregion
};

Date.prototype.toStringNCIC = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();

    var formatTime = FormatDate.toLowerCase();

    if (formatTime === "mm/dd/yyyy") {
        return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy;
    }
    else if (formatTime === "dd/mm/yyyy") {
        return (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy;
    }
    else if (formatTime === "yyyy/mm/dd") {
        return yyyy + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]);
    }
    else if (formatTime === "yyyy/dd/mm") {
        return yyyy + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]);
    }

    return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy;
};
Date.prototype.toISOStringTimeNCIC = function () {
    var yyyy = this.getUTCFullYear().toString();
    var mm = (this.getUTCMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getUTCDate().toString();
    var h = this.getUTCHours().toString();
    var m = this.getUTCMinutes().toString();
    var s = this.getUTCSeconds().toString();

    var formatTime = FormatDate.toLowerCase();

    var mDay = "";

    if (formatTime === "mm/dd/yyyy") {
        mDay = (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy;
    }
    else if (formatTime === "dd/mm/yyyy") {
        mDay = (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy;
    }
    else if (formatTime === "yyyy/mm/dd") {
        mDay = yyyy + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]);
    }
    else if (formatTime === "yyyy/dd/mm") {
        mDay = yyyy + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]);
    }
    else {
        mDay = (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy;
    }

    var mTime = (h[1] ? h : "0" + h[0]) + ":" + (m[1] ? m : "0" + m[0]) + ":" + (s[1] ? s : "0" + s[0]);

    return mDay + " " + mTime;
};
Date.prototype.toStringTimeNCIC = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var h = this.getHours().toString();
    var m = this.getMinutes().toString();
    var s = this.getSeconds().toString();

    var formatTime = FormatDate.toLowerCase();

    var mDay = "";

    if (formatTime === "mm/dd/yyyy") { mDay = (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy; }
    else if (formatTime === "dd/mm/yyyy") { mDay = (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy; }
    else if (formatTime === "yyyy/mm/dd") { mDay = yyyy + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]); }
    else if (formatTime === "yyyy/dd/mm") { mDay = yyyy + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]); }
    else { mDay = (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy; }

    var mTime = (h[1] ? h : "0" + h[0]) + ":" + (m[1] ? m : "0" + m[0]) + ":" + (s[1] ? s : "0" + s[0]);

    return mDay + " " + mTime;
};

//#region Timer
function TimerCountDownClass(sender, duration, func) {
    this.timer = duration;
    this.minutes = 0;
    this.seconds = 0;
    var _TimerCountDownClass = this;

    this.Update = function () {
        this.minutes = parseInt(this.timer / 60, 10);
        this.seconds = parseInt(this.timer % 60, 10);
        this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
        this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;
        $(sender).html(this.minutes + ":" + this.seconds);
        this.timer = this.timer - 1;
        if (this.timer <= 0) {
            if (func !== undefined && func !== null) { func(); }
            this.Stop();
        }
    };
    this.Interval = null;
    this.Run = function () {
        this.Stop();
        this.Interval = setInterval(function () { _TimerCountDownClass.Update(); }, 1000);
    };
    this.Stop = function () {
        if (this.Interval !== null) {
            clearInterval(this.Interval);
        }
    };
}
//#endregion
//#region UPLOAD FILE
var SUpFILE = {
    Data: [],
    Find: function (id) {
        for (var i = 0; i < this.Data.length; i++) {
            if (this.Data[i].Id === id) { return this.Data[i]; }
        }
        return null;
    },
    Click: function (sender) {
        var id = $(sender).attr('id');
        var obj = this.Find(id);
        if (obj === null) return;
        obj.Click();
    },
    Browse: function (e) {
        var ms = e.currentTarget.attributes["ms"].nodeValue;
        var obj = this.Find(ms);
        if (obj === null) return;
        obj.Browse(e);
    }
};
function SUpFILECL(infoInit) {

    SUpFILE.Data.push(this);
    var _SUpFILE = this;
    this.ElementId = infoInit.sender;
    this.Sender = SUtil.J(this.ElementId);
    this.Id = SUtil.GetRadomKeyPlus('imgup');
    this.File = null;
    this.accept = SUtil.Default(infoInit.accept, "");
    var htmlTemp = '<div class="file-upload" id="{0}" onclick="SUpFILE.Click(this)">\
                        <img id="{0}img" src="{1}" />\
                        <h5 id="{0}title">' + LNG.GetValue("uploadfile", "browseFile", "Browse or drop file to here") + '</h5>\
                    </div>\
                    <input id="{0}btn" ms="{0}" type="file" class="hidden" onchange="SUpFILE.Browse(event)" accept="{2}" />';

    this.Sender.html(String.format(htmlTemp, this.Id, this.Source, this.accept));
    this.ChangImg = false;
    this.OnChange = null;
    this.Click = function () { SUtil.J(this.Id + 'btn').click(); };

    this.Extensions = ".zip";
    this.CheckFile = function (file) {
        if (file.size > this.MAX_FILE_SIZE) {
            MESSAGE.ok({ html: String.format(LNG.GetValue("uploadfile", "notsupportfilethan", "Not support file more than {0}MB."), 10) });
            return false;
        }
        if (this.Extensions.length > 0) {
            var sFileExtension = file.name.split('.')[file.name.split('.').length - 1];
            var index = this.Extensions.indexOf(sFileExtension.toLowerCase());
            if (index < 0) {
                MESSAGE.ok({ html: String.format(LNG.GetValue("uploadfile", "fileIncorrectFormat", "Wrong format, please select file {0} "), this.Extensions) });
                return false;
            }
        }
        return true;
    };
    this.Browse = function (event) {
        if (event.target.files.length === 0) { return; }
        var file = event.target.files[0];
        if (this.CheckFile(file) === false) return;
        this.Set({ File: file });
        if (_SUpFILE.OnChange !== null) { _SUpFILE.OnChange(file); }
    };

    this.Set = function (info) {
        if (info.File !== undefined) {
            this.File = info.File;
            SUtil.J(this.Id + 'title').html(this.File.name);
        }
        if (info.Title !== undefined) { SUtil.J(this.Id + 'title').html(info.Title); }
        if (info.Extensions !== undefined) { this.Extensions = info.Extensions; }
        //if (info.accept !== undefined) { this.accept = info.accept; }
    };
    this.Set(infoInit);
}
//#endregion

//#region UPLOAD MULTIIMAGE
var SUpMulIMG = {
    LockClick: false,
    Data: [],
    Find: function (id) {
        for (var i = 0; i < this.Data.length; i++) {
            if (this.Data[i].Id === id) {
                return this.Data[i];
            }
        }
        return null;
    },
    Click: function (sender) {

        if (this.LockClick) return;

        var id = $(sender).attr('id');
        var obj = this.Find(id);
        if (obj === null) return;
        obj.Click();
    },
    Browse: function (e) {
        var ms = e.currentTarget.attributes["ms"].nodeValue;
        var obj = this.Find(ms);
        if (obj === null) return;
        obj.Browse(e);
    },

    Delete: function (sender) {
        this.LockClick = true;
        var id = $(sender).attr('data-id');
        var obj = this.Find(id);
        if (obj === null) return;
        obj.Set({ Delete: $(sender).attr('data-imgid') });
        setTimeout(function () { SUpMulIMG.LockClick = false; }, 200);
    },

    Drop: function (ev) {
        //console.log('File(s) dropped');

        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();


        var ms = ev.currentTarget.attributes["id"].nodeValue;
        var objUpload = SUpMulIMG.Find(ms);
        if (objUpload === null) return;


        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)

            var arrFiles = new Array();

            for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[i].kind === 'file') {
                    var file = ev.dataTransfer.items[i].getAsFile();
                    console.log('... file[' + i + '].name = ' + file.name);
                    arrFiles.push(file);
                }
            }
            if (arrFiles.length > 0) {
                objUpload.AddFile(arrFiles, false, 0);
            }

        } else {
            // Use DataTransfer interface to access the file(s)
            for (var c = 0; c < ev.dataTransfer.files.length; c++) {
                console.log('... file[' + c + '].name = ' + ev.dataTransfer.files[c].name);
            }
        }

        // Pass event to removeDragData for cleanup
        console.log('Removing drag data');
        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to remove the drag data
            ev.dataTransfer.items.clear();
        } else {
            // Use DataTransfer interface to remove the drag data
            ev.dataTransfer.clearData();
        }
    },

    DragOver: function (ev) {
        //console.log('File(s) in drop zone');
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
    }

};

function BrowserImageCL(infoInit) {
    SUpMulIMG.Data.push(this);
    var _SUpMulIMG = this;
    this.ElementId = infoInit.sender;
    this.Sender = SUtil.J(this.ElementId);
    this.Id = SUtil.GetRadomKeyPlus('imgup');
    this.Source = new Array();
    this.MAX = 10;
    this.MAX_NUMBER = 5;
    this.bReplaceOldest = false;

    this.Render = function () {
        var htmlImg = '<div>\
                            <div>\
                                <img id="{0}" style="display:inline" src="{1}" />\
                                <i data-id="{2}" data-imgid="{0}" onclick="SUpMulIMG.Delete(this)" class="fa fa-times" aria-hidden="true"></i>\
                            </div>\
                        </div>';

        var scriptIMG = "";
        for (var c = 0; c < this.Source.length; c++) {
            var objIMG = this.Source[c];
            scriptIMG += String.format(htmlImg, objIMG.Id, objIMG.Base64, this.Id);
        }

        if (SUtil.J(this.Id + "btn").length === 0) {
            var htmlTemp = '<div class="img-upload" id="{0}" onclick="SUpMulIMG.Click(this)" ondrop="SUpMulIMG.Drop(event);" ondragover="SUpMulIMG.DragOver(event);">\
                                <div class="_dvImg" id="{0}img">{3}</div>\
                                <div class="_dvMsg"><h5 id="{0}title">{2}</h5></div>\
                            </div>\
                            <input id="{0}btn" ms="{0}" type="file" class="hidden" accept="image/*" onchange="SUpMulIMG.Browse(event)" multiple/>';
            this.Sender.html(String.format(htmlTemp, this.Id, this.Source, LNG.GetValue("uploadfile", "browseImage", "Browse or drop image to here"), scriptIMG));
        }
        else {
            SUtil.J(this.Id + "img").html(scriptIMG);
        }
    };
    this.Render();

    //this.ChangImg = false;
    this.OnChange = null;
    this.Click = function () { SUtil.J(this.Id + 'btn').click(); };
    this.format = "jpg";

    this.MAX_FILE_SIZE = 10 * 1024 * 1024;
    this.Extensions = ".bmp, .jpeg, .jpg, .png";
    this.CheckFile = function (file, bMesg) {
        if (file.size > this.MAX_FILE_SIZE) {
            if (bMesg) {
                MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "notsupportfilethan", "Not support file more than {0}MB."), 10) });
            }
            else {
                MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "fileOutSize", "File {0} more than {1}MB"), file.name, 10) });
            }
            return false;
        }
        if (this.Extensions.length > 0) {
            var sFileExtension = file.name.split('.')[file.name.split('.').length - 1];
            var index = this.Extensions.indexOf(sFileExtension.toLowerCase());
            if (index < 0) {
                if (bMesg) {
                    MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "fileIncorrectFormat", "Wrong format, please select file {0} "), this.Extensions) })
                }
                else {
                    MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "fileWrongFormat", "File {0} is wrong format"), file.name) });
                }
                return false;
            }
        }
        return true;
    };
    this.sizeOfImage = { width: 1920, height: 1920 };

    this.AddFile = function (files, bMesg, index) {

        if (index >= files.length) { return; }

        if (this.Source.length >= this.MAX_NUMBER) {
            if (this.bReplaceOldest === false) {
                MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "maxNumber", "Maximun is {0} image(s)"), this.MAX_NUMBER) });
                return;
            }
            else {
                this.Source.shift();

            }
        }

        var file = files[index];
        for (var c = 0; c < this.Source.length; c++) {
            if (file.name === this.Source[c].Name) {
                if (bMesg) {
                    MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "fileExisted", "{0} is existed"), file.name) });
                }
                else {
                    MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "fileExisted", "{0} is existed"), file.name) });
                }
                return;
            }
        }
        if (this.CheckFile(file, bMesg) === false) return;
        var img = new Image();
        img.onload = function () {
            var base64 = ImageUtilities.LimitSizeOfImage(img, _SUpMulIMG.sizeOfImage, _SUpMulIMG.format).base64;
            _SUpMulIMG.ChangImg = true;
            _SUpMulIMG.Set({ Add: { Id: SUtil.GetRadomKeyPlus("img"), Base64: base64, Name: file.name } });
            if (_SUpMulIMG.OnChange !== null) { _SUpMulIMG.OnChange(base64); }

            index++;
            _SUpMulIMG.AddFile(files, bMesg, index);
        };
        img.src = URL.createObjectURL(file);
    };

    this.Browse = function (event) {
        if (event.target.files.length === 0) { return; }
        this.AddFile(event.target.files, true, 0);

        //Remove 
        event.target.value = null;

    };

    this.loadURL = function (urls) {
        this.Source = [];
        for (var i = 0; i < urls.length; i++) {
            _SUpMulIMG.ChangImg = false;
            _SUpMulIMG.Set({ Add: { Id: SUtil.GetRadomKeyPlus("img"), Base64: urls[i], Name: urls[i] } });
        }
        if (urls.length === 0) {
            _SUpMulIMG.Set({ Change: false });
        }
    };

    this.Set = function (info) {

        if (info.Add !== undefined) {

            if (this.Source.length >= this.MAX_NUMBER) {
                MESSAGE.show({ text: String.format(LNG.GetValue("uploadfile", "maxNumber", "Maximun is {0} image(s)"), this.MAX_NUMBER) });
            }
            else {
                this.Source.push(info.Add);
                this.Render();
                SUtil.J(this.Id + "img").animate({ scrollLeft: this.Source.length * 150 }, 1000);
            }
        }
        if (info.Delete !== undefined) {
            for (var i = 0; i < this.Source.length; i++) {
                if (this.Source[i].Id === info.Delete) {
                    this.Source.splice(i, 1);
                    break;
                }
            }
            this.ChangImg = true;
            this.Render();
        }

        if (info.Change !== undefined) { this.ChangImg = info.Change; }
        if (info.bReplaceOldest !== undefined) { this.bReplaceOldest = info.bReplaceOldest; }

        if (info.format !== undefined) { this.format = info.format; }
        if (info.sizeOfImage !== undefined) { this.sizeOfImage = info.sizeOfImage; }

        if (info.MAX !== undefined) { this.MAX = info.MAX; }
        if (info.MAX_NUMBER !== undefined) { this.MAX_NUMBER = info.MAX_NUMBER; }

        if (this.Source.length > 0) {
            SUtil.J(this.Id + 'title').parent().hide();
            SUtil.J(this.Id + 'img').show();
        }
        else {
            SUtil.J(this.Id + 'img').hide();
            SUtil.J(this.Id + 'title').parent().show();
        }


    };

    this.Set(infoInit);
}
//#endregion

//#region UPLOAD MANY FILES
function SUpMFILECL(infoInit) {

    //#region PROPERTIES
    SUpMFILECL.data.push(this);
    var _SUpMFILECL = this;
    this.sender = infoInit.sender;
    this.id = SUtil.GetRadomKeyPlus('imgup');
    this.title = LNG.GetValue("uploadfile", "browseFile", "Browse or drop files to here");
    this.extensions = ".zip";
    this.htmlFile = '<div class="_file" id="{3}_file" data-locked="{6}" data-color="{7}">\
                        <div id="{3}_probar" style="width: {5}%" class="_process"></div>\
                        <table>\
                            <tr>\
                                <td class="_stt">{0}</td>\
                                <td class="_name">{1} </td>\
                                <td class="_size">{2} MB</td>\
                                <td class="_btn" onclick="SUpMFILECL.delete(\'{1}\', \'{3}\', event)"><i class="fa fa-trash" aria-hidden="true"></i></td>\
                            </tr>\
                        </table >\
                        <div class="_progress">\
                            <span id="{3}_msg">{4}</span>\
                        </div>\
                    </div>';
    this.files = [];
    this.body = null;

    this.fileSize = 10;
    this.MAX_FILE_SIZE = 10 * 1024 * 1024;

    this.maxNumber = 10;
    this.urlReqCheck = "";

    this.mesg = null;

    //#endregion

    //#region ADD FILE
    this.render = function () {
        if (this.body === null) return;
        if (this.files.length === 0) {
            this.body.innerHTML = String.format('<h5>{0}</h5>', this.title);
        }
        else {
            var script = "";
            for (let i = 0; i < this.files.length; i++) {
                var file = this.files[i].file;
                script += String.format(this.htmlFile,
                    i + 1,
                    file.name,
                    (file.size / (1024 * 1024)).toFixed(2),
                    this.id,
                    this.files[i].note,
                    this.files[i].upload,
                    this.locked,
                    this.files[i].color
                );
            }
            this.body.innerHTML = script;
        }
    };

    this.createHtml = function () {

        var htmlTemp = '<div class="file-uploads" id="{0}" onclick="SUpMFILECL.click(this)" ondrop="SUpMFILECL.drop(event)" ondragover="SUpMFILECL.dragOver(event)"></div>\
                        <input id="{0}btn" ms="{0}" type="file" class="hidden" onchange="SUpMFILECL.browse(event)" accept="{1}"/>';

        document.getElementById(this.sender).innerHTML = String.format(htmlTemp, this.id, this.extensions);
        this.body = document.getElementById(this.id);
        this.render();

    };

    this.set = function (info) {
        if (info.title !== undefined) { this.title = info.title; }
        if (info.extensions !== undefined) { this.extensions = info.extensions; }
        if (info.fileSize !== undefined) {
            this.fileSize = info.fileSize;
            this.MAX_FILE_SIZE = this.fileSize * 1024 * 1024;
        }
        if (info.maxNumber !== undefined) { this.maxNumber = info.maxNumber; }
        if (info.urlReqCheck !== undefined) { this.urlReqCheck = info.urlReqCheck; }

        if (this.mesg === null) {
            this.mesg = {
                noFile: LNG.GetValue('uploadfile', 'no-file', 'There are not file to upload')
            };
        }

        this.render();
    };

    this.addFile = function (file) {
        if (this.checkFile(file) === false) { return; }

        var note = String.format(LNG.GetValue('uploadfile', 'upload-percent', 'Upload: {0} %'), 0);

        if (this.maxNumber === 1) {
            this.files = [{ file: file, uploaded: 0, note: note, color: SUpMFILECL.COLOR.DEFAULT }];
        }
        else {
            if (this.files.length >= this.maxNumber) {
                NoticeHTML.Info({ msg: LNG.GetValue("uploadfile", "note-maxNumber", "Sorry! Exceeded the allowed amount") });
                return;
            }
            var existed = this.files.find(x => { return x.file.name === file.name; });
            if (existed != null) {

                NoticeHTML.Info({ msg: String.format(LNG.GetValue('uploadfile', 'Already-exists', 'Already exists {0}'), file.name) });
                return;
            }
            this.files.push({ file: file, uploaded: 0, note: note, color: SUpMFILECL.COLOR.DEFAULT });
        }
        this.render();
    };
    this.set(infoInit);
    this.createHtml();

    this.delete = function (name) {

        if (this.locked) return;

        for (let i = 0; i < this.files.length; i++) {
            if (this.files[i].file.name === name) {
                this.files.splice(i, 1);
                break;
            }
        }
        this.render();

    };
    this.click = function () {
        if (this.locked) return;
        SUtil.J(this.id + 'btn').click();
    };

    this.checkFile = function (file) {
        if (file.size > this.MAX_FILE_SIZE) {
            NoticeHTML.Warning({
                msg: String.format(
                    LNG.GetValue("uploadfile", "notsupportfilethan", "Not support file more than {0}MB."),
                    this.fileSize)
            });
            return false;
        }
        if (this.extensions.length > 0) {
            var sFileExtension = file.name.split('.')[file.name.split('.').length - 1];
            var index = this.extensions.indexOf(sFileExtension.toLowerCase());
            if (index < 0) {
                NoticeHTML.Warning({
                    msg: String.format(
                        LNG.GetValue("uploadfile", "fileIncorrectFormat", "Wrong format, please select file {0} "),
                        this.extensions)
                });
                return false;
            }
        }

        if (this.urlReqCheck.length > 0) {
            setTimeout(function () {
                _SUpMFILECL.checkFileNameExisted(file, function (res) {
                    var obj = _SUpMFILECL.files.find(x => x.file.name === file.name);
                    if (obj === null || obj === undefined) return;
                    switch (res) {
                        case "EXIST": {
                            obj.note = String.format(LNG.GetValue('uploadfile', 'fileExisted', '{0} is existed'), file.name);
                            obj.color = SUpMFILECL.COLOR.DONE;
                            obj.upload = 100;
                            _SUpMFILECL.render();
                            break;
                        }
                        case "ERROR": {
                            obj.upload = 100;
                            obj.color = SUpMFILECL.COLOR.ERROR;
                            obj.note = LNG.GetValue('uploadfile', 'can-not-check', 'Can not check this file');
                            _SUpMFILECL.render();
                            break;
                        }
                        case "OK": {
                            obj.color = SUpMFILECL.COLOR.DEFAULT;
                            break;
                        }
                    }
                });
            }, 1000);
        }

        return true;

    };
    this.browse = function (event) {

        if (this.locked) return;

        if (event.target.files.length === 0) { return; }
        var file = event.target.files[0];
        this.addFile(file);
    };
    //#endregion

    //#region UPLOAD

    this.urlReq = "";

    this.onDoneUpload = null;
    this.onDoneFile = null;
    this.onErrorFile = null;
    this.ajaxUpload = null;
    this.locked = false;

    this.upload = function (urlReq) {

        if (this.files.length === 0) {
            MESSAGE.ok({ html: this.mesg.noFile });
            return false;
        }

        if (this.locked) {
            //INPROCESS
            return false;
        }

        this.urlReq = urlReq;
        this.uploadFile(0);

        return true;
    };

    this.fileFocus = null;

    this.nextUploadFile = function (index) {
        index++;
        this.uploadFile(index);
    };

    this.uploadFile = function (index) {

        //console.log("uploadFile: " + index);

        if (this.files.length <= index) {
            this.locked = false;
            if (this.onDoneUpload !== null) {
                setTimeout(function () { _SUpMFILECL.onDoneUpload() }, 200);
            }
            //NoticeHTML.Success({ msg: LNG.GetValue('uploadfile', 'upload-complete', 'Upload complete') });
            this.render();
            return;
        }

        this.locked = true;
        this.fileFocus = this.files[index];

        if (this.fileFocus.upload >= 100) {
            this.nextUploadFile(index);
            return;
        }

        this.render();

        var formdata = new FormData();
        formdata.append("file" + index.toString(), this.files[index].file);
        this.ajaxUpload = new XMLHttpRequest();

        this.ajaxUpload.upload.addEventListener("progress", function (e) {
            var percent = (e.loaded / e.total) * 100;
            _SUpMFILECL.fileFocus.upload = percent;
            _SUpMFILECL.fileFocus.note = String.format(LNG.GetValue('uploadfile', 'upload-percent', 'Upload: {0} %'), percent.toFixed(1));
            _SUpMFILECL.render();
        }, false);

        this.ajaxUpload.addEventListener("load", function (e) {
            _SUpMFILECL.fileFocus.upload = 100;
            _SUpMFILECL.fileFocus.note = LNG.GetValue('uploadfile', 'upload-complete', 'Upload complete');
            _SUpMFILECL.fileFocus.color = SUpMFILECL.COLOR.DONE;
            if (_SUpMFILECL.onDoneFile !== null) { _SUpMFILECL.onDoneFile(_SUpMFILECL.fileFocus, e.target.response); }
            _SUpMFILECL.nextUploadFile(index);
        }, false);

        this.ajaxUpload.addEventListener("error", function (e) {
            let item = _SUpMFILECL.files[index];
            item.note = LNG.GetValue('uploadfile', 'can-not-upload', 'Can not upload');
            if (_SUpMFILECL.onErrorFile !== null) { _SUpMFILECL.onErrorFile(_SUpMFILECL.fileFocus.file); }
            _SUpMFILECL.nextUploadFile(index);
        }, false);

        this.ajaxUpload.addEventListener("abort", function () {
            console.log("Abort Upload");
        }, false);

        this.ajaxUpload.open("POST", this.urlReq);
        this.ajaxUpload.send(formdata);

    };

    this.checkFileNameExisted = function (file, callback) {
        var urlReq = this.urlReqCheck + "&name=" + file.name;
        $.get(urlReq, function (res) {
            callback(res)
        }).fail(function () { callback("ERROR"); });
    }

    this.abort = function () {

        if (this.ajaxUpload === null) return true;

        try {
            this.ajaxUpload.abort();
            this.locked = false;
            this.render();
            return true;
        }
        catch (e) {
            return false;
        }
    }
    //#endregion

}

//#region STATIC
SUpMFILECL.data = [];
SUpMFILECL.click = function (sender) {
    var obj = this.data.find(x => x.id === sender.id);
    obj.click();
};
SUpMFILECL.browse = function (e) {
    var ms = e.currentTarget.attributes["ms"].nodeValue;
    var obj = this.data.find(x => x.id === ms);
    obj.browse(e);
};
SUpMFILECL.drop = function (ev) {

    ev.preventDefault();
    var ms = ev.currentTarget.attributes["id"].nodeValue;
    var objUpload = this.data.find(x => x.id === ms);
    if (objUpload === null) return;
    if (ev.dataTransfer.items) {
        var arrFiles = new Array();
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                var file = ev.dataTransfer.items[i].getAsFile();
                arrFiles.push(file);
            }
        }
        arrFiles.forEach(function (item) { objUpload.addFile(item); });
    }
};
SUpMFILECL.dragOver = function (ev) {
    ev.preventDefault();
};
SUpMFILECL.delete = function (name, id, e) {
    e.stopPropagation();
    var obj = this.data.find(x => x.id === id);
    obj.delete(name);
};

SUpMFILECL.COLOR = {
    DEFAULT: 0,
    ERROR: 1,
    DONE: 2
};
//#endregion

//#endregion


function MSelectItemCL(props) {

    this.id = 'mselectitem_' + MSelectCL.count++;
    this.id_mselect = props.id_mselect;

    this.html = '';
    this.callback = null;
    this.check = 0; //0, 1, 2
    this.enable = true;
    this.visible = true;
    this.data = null;
    this.type = '';
    this.badge = -1;

    this.refresh = function () { };

    this.set = function (info) {
        if (info.html !== undefined) { this.html = info.html; }
        if (info.data !== undefined) { this.data = info.data; }
        if (info.callback !== undefined) { this.callback = info.callback; }
        if (info.check !== undefined) { this.check = info.check; }
        if (info.enable !== undefined) { this.enable = info.enable; }
        if (info.visible !== undefined) { this.visible = info.visible; }
        if (info.badge !== undefined) { this.badge = info.badge; }
        if (info.refresh === true) { this.refresh(); }
    };
    this.set(props);

    //this.ICON = {
    //    Check: '<i class="fas fa-check-square"></i>',
    //    UnCheck: '<i class="far fa-square"></i>',
    //    UnCheckALL: '<i class="far fa-minus-square"></i>',
    //};

    this.ICON = {
        Check: `<i class="cobalt-chk" data-check="1"></i>`,
        UnCheck: `<i class="cobalt-chk" data-check="0"></i>`,
        UnCheckALL: `<i class="cobalt-chk" data-check="2"></i>`,
    };

    this.createHtml = function () {

        if (this.visible === false) return ``;

        var icon = "";
        switch (this.check) {
            case 0: { icon = this.ICON.UnCheck; break; }
            case 1: { icon = this.ICON.Check; break; }
            default: { icon = this.ICON.UnCheckALL; break; }
        }

        var html_badge = ``;
        if (this.badge >= 0) {
            html_badge = `(${this.badge})`;
        }


        return `<li id="${this.id}" data-check="${this.check}" onclick="MSelectCL.click(event,'${this.id_mselect}','${this.id}')">
                   ${icon}${this.html} ${html_badge}
                </li>`;

    };

    this.refresh = function () { $('#' + this.id).replaceWith(this.createHtml()); };

    this.click = function (check) {
        if (check === undefined) {
            if (this.check === 1 || this.check === 2) { this.check = 0; }
            else { this.check = 1; }
        }
        else { this.check = check; }
        this.refresh();
        if (this.callback !== null) { this.callback(this); }
    };

}

function MSelectCL(props) {

    //#region PROPERTIES

    this.parentId = props.parentId;
    this.id = 'mselect_' + MSelectCL.count++;
    MSelectCL.register(this);

    this.useChkAll = true;
    this.useSearch = false;

    this.items = [];
    this.chkAll = null;

    this.placeholder = "Please Select...";

    this.texts = {
        noData: 'No Data Available',
        placeholder: 'Please Select...'
    };

    this.type = 0;

    this.size = { width: '100%', height: '300px' };
    this.width = '100%';

    this.bToggle = false;
    this.enable = true;

    //#endregion

    //#region EVENT

    this.onChange = null;
    this.memory_select_lst = [];
    this.calcOnChangeEvent = function (type) {

        if (this.onChange === null) return;
        let selected = this.items.filter(x => x.check === 1);
        let array1 = selected.map(x => x.id);
        let array2 = this.memory_select_lst;

        if (array1.length !== array2.length) {
            this.onChange(type);
            return;
        }

        let equal = array1.every(function (value, index) {
            return value === array2[index];
        });

        if (equal === false) { this.onChange(type); }


    };

    this.onToggle = null;

    //#endregion

    //#region UNDIFINE

    this.setItems = function (newItems) {

        //Update Items,  Keep old check if exist
        let olds = this.items.filter(x => x.check === 1).map(x => x.html);
        let check = 0;

        if (this.items.length === 0) { check = 1; }
        else if (olds.length === this.items.length) { check = 1; }
        else if (olds.length > 0) { check = 2; }
        else { check = 0; }

        this.items = [];

        if (check == 0 || check == 1) {
            for (let i = 0; i < newItems.length; i++) {
                newItems[i].id_mselect = this.id;
                newItems[i].check = check;
                this.items.push(new MSelectItemCL(newItems[i]));
            }
        }
        else {
            for (let i = 0; i < newItems.length; i++) {
                newItems[i].id_mselect = this.id;
                var existed = olds.find(x => x.html === newItems[i].html);
                newItems[i].check = existed ? 1 : 0;
                this.items.push(new MSelectItemCL(newItems[i]));
            }
        }

        if (newItems.length > 10) { this.useSearch = true; }

        this.refresh();

    };

    this.set = function (info) {

        if (info.placeholder !== undefined) { this.placeholder = info.placeholder; }
        if (info.size !== undefined) { this.size = info.size; }
        if (info.width !== undefined) { this.width = info.width; }
        if (info.items !== undefined) {
            this.items = [];
            for (let i = 0; i < info.items.length; i++) {
                info.items[i].id_mselect = this.id;
                this.items.push(new MSelectItemCL(info.items[i]));
            }
            if (info.items.length > 10) { this.useSearch = true; }
        }
        if (info.useSearch !== undefined) { this.useSearch = info.useSearch; }
        if (info.chkAll !== undefined) {
            this.chkAll = new MSelectItemCL(info.chkAll);
        }
        if (info.useChkAll !== undefined) { this.useChkAll = info.useChkAll; }
        if (info.enable !== undefined) {
            this.enable = info.enable;
            if (document.getElementById(this.id) !== null) {
                document.getElementById(this.id).setAttribute('data-enable', this.enable);
            }
        }
        if (info.texts !== undefined) {
            let texts = info.texts;
            if (texts.noData !== undefined) this.texts.noData = texts.noData;
            if (texts.placeholder !== undefined) this.texts.placeholder = texts.placeholder;
        }
        if (info.refresh === true) { this.createHtml(); }

        if (info.onChange !== undefined) { this.onChange = info.onChange; }
        if (info.onToggle !== undefined) { this.onToggle = info.onToggle; }

    };

    this.clickAll = function (flag) {
        if (flag === undefined) { flag = this.chkAll.check > 0 ? 0 : 1; }

        this.chkAll.check = flag;
        this.chkAll.refresh();

        var visibles = this.items.filter(x => x.visible === true);

        visibles.forEach(function (item) { item.set({ check: flag }); });

        var html_items = '';
        visibles.forEach(function (item) { html_items += item.createHtml(); });
        document.getElementById(`${this.id}_items`).innerHTML = html_items;

        this.showMessageSelected();
    }

    this.updateChkAll = function () {

        if (this.useChkAll === false) return;

        var visibles = this.items.filter(x => x.visible === true);

        var items = visibles.filter(x => x.check === 1);
        if (items.length === 0) {
            this.chkAll.set({ check: 0, refresh: true });
        }
        else if (items.length === visibles.length) {
            this.chkAll.set({ check: 1, refresh: true });
        }
        else {
            this.chkAll.set({ check: 2, refresh: true });
        }

    };

    this.click = function (chkId) {

        if (this.useChkAll && chkId == this.chkAll.id) {
            this.clickAll();
            return;
        }

        var chk = this.items.find(x => x.id === chkId);
        chk.click();

        this.showMessageSelected();
        this.updateChkAll();

        //this.calcOnChangeEvent('click');

    }

    this.toggle = function (event, bOpen) {
        if (this.enable == false) {
            //bOpen = 'false';
            //document.getElementById(this.id).setAttribute('data-toggle', bOpen);
            //document.getElementById(this.id).setAttribute('data-toggle', bOpen);
            return;
        }

        if (document.getElementById(this.id).getAttribute('data-toggle') === bOpen) { return; }

        if (bOpen === undefined) {
            bOpen = document.getElementById(this.id).getAttribute('data-toggle') === 'true' ? 'false' : 'true';
        }
        if (bOpen === 'true') {

            //CLOSE OTHER SELECT
            for (let i = 0; i < MSelectCL.data.length; i++) {
                if (MSelectCL.data[i].id === this.id)
                    continue;
                MSelectCL.data[i].toggle(null, 'false');
            }

            //CLOSE OTHER RADIO
            for (let i = 0; i < MRadioCL.data.length; i++) {
                MRadioCL.data[i].toggle(null, 'false');
            }


            //REMOVE FILTER
            if (this.useSearch) {
                document.getElementById(`${this.id}_txtfilter`).value = '';
                this.filter();
            }

            if (event !== null && event !== undefined) {
                var height = parseInt(this.size.height);
                let direct = event.clientY + height > window.innerHeight ? 1 : 0;
                document.getElementById(`${this.id}_toggle`).setAttribute('data-direct', direct);
            }


            let selected = this.items.filter(x => x.check === 1);
            this.memory_select_lst = selected.map(x => x.id);

            if (this.onToggle !== null) { this.onToggle('open'); }

        }
        else {
            if (this.onToggle !== null) { this.onToggle('close'); }
            this.calcOnChangeEvent('toggle-close');
        }
        document.getElementById(this.id).setAttribute('data-toggle', bOpen);
    };

    this.filter = function () {
        var key = document.getElementById(`${this.id}_txtfilter`).value;
        var count = 0;

        if (key.trim() === '') {
            this.items.forEach(function (item) { item.set({ visible: true }); });
            count = this.items.length;
        }
        else {
            key = key.toLowerCase();
            this.items.forEach(function (item) {
                var visible = item.html.toLowerCase().indexOf(key) >= 0 ? true : false;
                if (visible) count++;
                item.set({ visible: visible });
            });
        }


        this.chkAll.set({ badge: count });

        var html_items = '';
        this.items.forEach(function (item) {
            html_items += item.createHtml();
        });

        this.updateChkAll();
        document.getElementById(`${this.id}_items`).innerHTML = html_items;

    }

    this.showMessageSelected = function () {

        function getTextWidth(html, fontSize = 14, font = 'arial') {

            let text = document.createElement("span");

            text.style.font = font;
            text.style.fontSize = fontSize + "px";
            text.style.height = 'auto';
            text.style.width = 'auto';
            text.style.position = 'absolute';
            text.style.whiteSpace = 'no-wrap';
            text.innerHTML = html;

            document.body.appendChild(text);

            let width = text.clientWidth;

            document.body.removeChild(text);

            return width;

        }


        var text = '';

        var items = this.items.filter(x => x.check === 1);

        if (items.length === 0) {
            text = this.placeholder;
        }
        else if (items.length === this.items.length) {
            text = 'All';
        }
        else if (items.length === 1) {
            text = items[0].html;

            let widthOfText = getTextWidth(text);
            let widthOfContainer = document.getElementById(`${this.id}_result`).clientWidth * 0.8;

            if (widthOfText > widthOfContainer) {
                text = `1 Selected`;
            }

        }
        else {

            if (items.length < 10) {

                var mstr = '';
                items.forEach(function (item, index) {
                    mstr += item.html + ',';
                });

                mstr = mstr.substring(0, mstr.length - 1);

                let widthOfText = getTextWidth(mstr);

                let widthOfContainer = document.getElementById(`${this.id}_result`).clientWidth * 0.8;

                if (widthOfText <= widthOfContainer) {
                    text = mstr;
                }
                else {
                    text = `${items.length} Selected`;
                }
            }
            else {
                text = `${items.length} Selected`;
            }
        }
        document.getElementById(`${this.id}_result`).innerHTML = text;

    }

    this.createHtml = function () {
        document.getElementById(this.parentId).innerHTML = '';
        //this.iconToggle = this.bToggle ? '<i class="fas fa-angle-up"></i>' : '<i class="fas fa-angle-down"></i>';

        if (this.items.length === 0) {
            document.getElementById(this.parentId).innerHTML = `
                   <div class="mselectcl" id="${this.id}" style="width: ${this.width}">
                        <div class="_button" data-empty="true">
                            <p>${this.texts.noData}</p>
                        </div>
                    </div>
                `;
            return;
        }

        var html_items = '';
        this.items.forEach(function (item) {
            html_items += item.createHtml();
        });


        var html_search = ``;
        if (this.useSearch) {
            html_search = `
                <div class="_search">
                    <input id="${this.id}_txtfilter" onkeyup="MSelectCL.filter('${this.id}')" class="form-control form-control-sm son-textbox" placeholder="Search for..." />
                </div>
            `;
        }


        var html_chkAll = ``;
        if (this.useChkAll) {
            if (this.chkAll == null) {
                this.chkAll = new MSelectItemCL({ html: 'All', id_mselect: this.id, badge: this.items.length });
            }
            html_chkAll = `
                            <div class="_chkAll">
                                <ul class="_chkul">
                                    ${this.chkAll.createHtml()}
                                </ul>
                            </div>
                           `;
        }


        var html = `
                    <div class="mselectcl" id="${this.id}" onclick="MSelectCL.stopClick(event)" data-toggle="false" data-enable="${this.enable}" style="width: ${this.width}">
                        <div class="_button" onclick="MSelectCL.toggle(event,'${this.id}')">
                            <p id="${this.id}_result">&nbsp;</p>
                            <button type="button">
                                <i class="fas fa-caret-down" style="font-size: 18px"></i>
                            </button>
                        </div>
                        <div class="_toggle" data-direct="0" id="${this.id}_toggle" style="width: ${this.size.width}; height: ${this.size.height}">
                            ${html_search}
                            ${html_chkAll}
                            <div class="_items">
                                <ul class="_chkul" id="${this.id}_items">${html_items}</ul>
                            </div>
                        </div>
                    </div>
                    `;

        document.getElementById(this.parentId).innerHTML = html;

        var height = parseInt(this.size.height) - 10;
        if (this.useChkAll) height = height - 41;
        if (this.useSearch) height = height - 44;

        document.getElementById(`${this.id}_items`).parentNode.style.height = height + 'px';

        this.showMessageSelected();
        this.updateChkAll();

    };

    this.set(props);
    this.createHtml();

    this.clickOustside = function (e) {

        var flyoutElement = document.getElementById(`${this.id}`);
        var targetElement = e.target;  // clicked element
        do {
            if (targetElement == flyoutElement) {
                // This is a click inside. Do nothing, just return.
                //console.log( "Clicked inside!");
                return;
            }
            // Go up the DOM
            targetElement = targetElement.parentNode;

        } while (targetElement);

        // This is a click outside.
        //console.log("Clicked outside!");
        this.toggle(e, 'false');

    };

    this.getValue = function (bIgnoreIfAll = true) {
        var items = this.items.filter(x => x.check === 1);
        if (bIgnoreIfAll) {
            if (items.length == this.items.length)
                return [];
        }
        return items.map(x => x.data);
    }

    this.refresh = function () {
        try {
            //this.updateChkAll();
            //var html_items = '';
            //this.items.forEach(function (item) { html_items += item.createHtml(); });
            //document.getElementById(`${this.id}_items`).innerHTML = html_items;

            //this.showMessageSelected();

            this.createHtml();

            //console.log(`refresh, ${this.items.length}`);
            this.chkAll.set({ badge: this.items.length, refresh: true });

        }
        catch (e) {
            //
        }
    }

    //#endregion

}

MSelectCL.data = [];
MSelectCL.register = function (obj) {
    if (this.data.length == 0) {
        document.addEventListener('click', function (e) {
            //for (let i = 0; i < MSelectCL.data.length; i++) {
            //    MSelectCL.data[i].clickOustside(e);
            //}

            MSelectCL.data.forEach(obj => { obj.clickOustside(e); });
        });
    }
    this.data.push(obj);
};
MSelectCL.find = function (id) { return this.data.find(x => x.id === id); }
MSelectCL.count = 0;

MSelectCL.stopClick = function (event) {
    event.stopPropagation();
}

MSelectCL.click = function (event, mselectId, itemId) {
    if (event != null) { event.stopPropagation(); }
    var obj = this.find(mselectId);
    obj.click(itemId);
};

MSelectCL.filter = function (id) { var obj = this.find(id); obj.filter(); };
MSelectCL.toggle = function (event, id) { var obj = this.find(id); obj.toggle(event); }


function MRadioItemCL(props) {

    this.id = 'MRadioitem_' + MRadioCL.count++;
    this.id_MRadio = props.id_MRadio;

    this.html = '';
    this.callback = null;
    this.check = 0; //0, 1, 2
    this.enable = true;
    this.visible = true;
    this.data = null;
    this.type = '';
    this.badge = -1;

    this.refresh = function () { };

    this.set = function (info) {
        if (info.html !== undefined) { this.html = info.html; }
        if (info.data !== undefined) { this.data = info.data; }
        if (info.callback !== undefined) { this.callback = info.callback; }
        if (info.check !== undefined) { this.check = info.check; }
        if (info.enable !== undefined) { this.enable = info.enable; }
        if (info.visible !== undefined) { this.visible = info.visible; }
        if (info.badge !== undefined) { this.badge = info.badge; }
        if (info.refresh === true) { this.refresh(); }
    };
    this.set(props);

    this.ICON = {
        Check: '<i class="fas fa-check-circle"></i>',
        UnCheck: '<i class="far fa-circle"></i>',
    };

    this.createHtml = function () {

        if (this.visible === false) return ``;

        var icon = "";
        switch (this.check) {
            case 0: { icon = this.ICON.UnCheck; break; }
            case 1: { icon = this.ICON.Check; break; }
        }

        var html_badge = ``;
        if (this.badge >= 0) {
            html_badge = `(${this.badge})`;
        }


        return `<li id="${this.id}" data-check="${this.check}" onclick="MRadioCL.click(event,'${this.id_MRadio}','${this.id}')">
                   ${icon}${this.html} ${html_badge}
                </li>`;

    };

    this.refresh = function () { $('#' + this.id).replaceWith(this.createHtml()); };

    this.click = function (check) {


        if (check === undefined) {
            if (this.check === 1 || this.check === 2) { this.check = 0; }
            else { this.check = 1; }
        }
        else { this.check = check; }


        this.refresh();
        if (this.callback !== null) { this.callback(this); }
    };

}

function MRadioCL(props) {

    //#region PROPERTIES

    this.parentId = props.parentId;
    this.id = 'MRadio_' + MRadioCL.count++;
    MRadioCL.register(this);

    this.useSearch = false;

    this.items = [];

    this.placeholder = "Please Select...";

    this.texts = {
        noData: 'No Data Available',
        placeholder: 'Please Select...'
    };

    this.type = 0;

    this.size = { width: '100%', height: '300px' };
    this.width = '100%';

    this.bToggle = false;
    this.enable = true;

    //#endregion

    //#region EVENT

    this.onChange = null;
    this.memory_select_lst = [];
    this.calcOnChangeEvent = function (type) {

        if (this.onChange === null) return;
        let selected = this.items.filter(x => x.check === 1);
        let array1 = selected.map(x => x.id);
        let array2 = this.memory_select_lst;

        if (array1.length !== array2.length) {
            this.onChange(type);
            return;
        }

        let equal = array1.every(function (value, index) {
            return value === array2[index];
        });

        if (equal === false) { this.onChange(type); }


    };

    this.onToggle = null;

    //#endregion

    //#region UNDIFINE

    this.setItems = function (newItems) {

        //Update Items,  Keep old check if exist
        let olds = this.items.filter(x => x.check === 1).map(x => x.html);
        let check = 0;

        if (this.items.length === 0) { check = 1; }
        else if (olds.length === this.items.length) { check = 1; }
        else if (olds.length > 0) { check = 2; }
        else { check = 0; }

        this.items = [];

        if (check == 0 || check == 1) {
            for (let i = 0; i < newItems.length; i++) {
                newItems[i].id_MRadio = this.id;
                newItems[i].check = check;
                this.items.push(new MRadioItemCL(newItems[i]));
            }
        }
        else {
            for (let i = 0; i < newItems.length; i++) {
                newItems[i].id_MRadio = this.id;
                var existed = olds.find(x => x.html === newItems[i].html);
                newItems[i].check = existed ? 1 : 0;
                this.items.push(new MRadioItemCL(newItems[i]));
            }
        }

        if (newItems.length > 10) { this.useSearch = true; }

        this.refresh();

    };

    this.set = function (info) {

        if (info.placeholder !== undefined) { this.placeholder = info.placeholder; }
        if (info.size !== undefined) { this.size = info.size; }
        if (info.width !== undefined) { this.width = info.width; }
        if (info.items !== undefined) {
            this.items = [];
            for (let i = 0; i < info.items.length; i++) {
                info.items[i].id_MRadio = this.id;
                this.items.push(new MRadioItemCL(info.items[i]));
            }
            if (info.items.length > 10) { this.useSearch = true; }
        }
        if (info.useSearch !== undefined) { this.useSearch = info.useSearch; }


        if (info.enable !== undefined) {
            this.enable = info.enable;
            if (document.getElementById(this.id) !== null) {
                document.getElementById(this.id).setAttribute('data-enable', this.enable);
            }
        }
        if (info.texts !== undefined) {
            let texts = info.texts;
            if (texts.noData !== undefined) this.texts.noData = texts.noData;
            if (texts.placeholder !== undefined) this.texts.placeholder = texts.placeholder;
        }
        if (info.refresh === true) { this.createHtml(); }

        if (info.onChange !== undefined) { this.onChange = info.onChange; }
        if (info.onToggle !== undefined) { this.onToggle = info.onToggle; }

    };

    this.click = function (chkId) {
        this.items.forEach(item => {
            item.click(item.id === chkId ? 1 : 0);
        });
        this.showMessageSelected();
        //this.calcOnChangeEvent('click');
    }

    this.toggle = function (event, bOpen) {
        if (this.enable == false) {
            //bOpen = 'false';
            //document.getElementById(this.id).setAttribute('data-toggle', bOpen);
            //document.getElementById(this.id).setAttribute('data-toggle', bOpen);
            return;
        }

        if (document.getElementById(this.id).getAttribute('data-toggle') === bOpen) { return; }

        if (bOpen === undefined) {
            bOpen = document.getElementById(this.id).getAttribute('data-toggle') === 'true' ? 'false' : 'true';
        }
        if (bOpen === 'true') {

            //CLOSE OTHER SELECT
            for (let i = 0; i < MSelectCL.data.length; i++) {
                MSelectCL.data[i].toggle(null, 'false');
            }

            //CLOSE OTHER RADIO
            for (let i = 0; i < MRadioCL.data.length; i++) {
                if (MRadioCL.data[i].id === this.id)
                    continue;
                MRadioCL.data[i].toggle(null, 'false');
            }


            //REMOVE FILTER
            if (this.useSearch) {
                document.getElementById(`${this.id}_txtfilter`).value = '';
                this.filter();
            }

            if (event !== null && event !== undefined) {
                var height = parseInt(this.size.height);
                let direct = event.clientY + height > window.innerHeight ? 1 : 0;
                document.getElementById(`${this.id}_toggle`).setAttribute('data-direct', direct);
            }


            let selected = this.items.filter(x => x.check === 1);
            this.memory_select_lst = selected.map(x => x.id);

            if (this.onToggle !== null) { this.onToggle('open'); }

        }
        else {
            if (this.onToggle !== null) { this.onToggle('close'); }
            this.calcOnChangeEvent('toggle-close');
        }
        document.getElementById(this.id).setAttribute('data-toggle', bOpen);
    };

    this.filter = function () {
        var key = document.getElementById(`${this.id}_txtfilter`).value;
        var count = 0;

        if (key.trim() === '') {
            this.items.forEach(function (item) { item.set({ visible: true }); });
            count = this.items.length;
        }
        else {
            key = key.toLowerCase();
            this.items.forEach(function (item) {
                var visible = item.html.toLowerCase().indexOf(key) >= 0 ? true : false;
                if (visible) count++;
                item.set({ visible: visible });
            });
        }

        var html_items = '';
        this.items.forEach(function (item) {
            html_items += item.createHtml();
        });

        document.getElementById(`${this.id}_items`).innerHTML = html_items;

    }

    this.showMessageSelected = function () {

        function getTextWidth(html, fontSize = 14, font = 'arial') {

            let text = document.createElement("span");

            text.style.font = font;
            text.style.fontSize = fontSize + "px";
            text.style.height = 'auto';
            text.style.width = 'auto';
            text.style.position = 'absolute';
            text.style.whiteSpace = 'no-wrap';
            text.innerHTML = html;

            document.body.appendChild(text);

            let width = text.clientWidth;

            document.body.removeChild(text);

            return width;

        }


        var item = this.items.find(x => x.check === 1);
        var text = item !== undefined ? item.html : '';

        let widthOfText = getTextWidth(text);
        let widthOfContainer = document.getElementById(`${this.id}_result`).clientWidth * 0.8;

        if (widthOfText > widthOfContainer) {
            text = `1 Selected`;
        }

        document.getElementById(`${this.id}_result`).innerHTML = text;

    }

    this.createHtml = function () {
        document.getElementById(this.parentId).innerHTML = '';
        if (this.items.length === 0) {
            document.getElementById(this.parentId).innerHTML = `
                   <div class="mselectcl" id="${this.id}" style="width: ${this.width}">
                        <div class="_button" data-empty="true">
                            <p>${this.texts.noData}</p>
                        </div>
                    </div>
                `;
            return;
        }

        var html_items = '';
        this.items.forEach(function (item) {
            html_items += item.createHtml();
        });

        var html_search = ``;
        if (this.useSearch) {
            html_search = `
                <div class="_search">
                    <input id="${this.id}_txtfilter" onkeyup="MRadioCL.filter('${this.id}')" class="form-control" placeholder="Search for..." />
                </div>
            `;
        }

        var html = `
                    <div class="mselectcl" id="${this.id}" onclick="MRadioCL.stopClick(event)" data-toggle="false" data-enable="${this.enable}" style="width: ${this.width}">
                        <div class="_button" onclick="MRadioCL.toggle(event,'${this.id}')">
                            <p id="${this.id}_result">&nbsp;</p>
                            <button type="button">
                                <i class="fas fa-caret-down" style="font-size: 18px"></i>
                            </button>
                        </div>
                        <div class="_toggle" data-direct="0" id="${this.id}_toggle" style="width: ${this.size.width}; height: ${this.size.height}">
                            ${html_search}
                          
                            <div class="_items">
                                <ul class="_chkul" id="${this.id}_items">${html_items}</ul>
                            </div>
                        </div>
                    </div>
                    `;

        document.getElementById(this.parentId).innerHTML = html;

        var height = parseInt(this.size.height) - 10;
        if (this.useSearch) height = height - 44;

        document.getElementById(`${this.id}_items`).parentNode.style.height = height + 'px';

        this.showMessageSelected();


    };

    this.set(props);
    this.createHtml();

    this.clickOustside = function (e) {

        var flyoutElement = document.getElementById(`${this.id}`);
        var targetElement = e.target;  // clicked element
        do {
            if (targetElement == flyoutElement) {
                // This is a click inside. Do nothing, just return.
                //console.log( "Clicked inside!");
                return;
            }
            // Go up the DOM
            targetElement = targetElement.parentNode;

        } while (targetElement);
        this.toggle(e, 'false');
    };

    this.getValue = function () {
        let item = this.items.find(x => x.check === 1);
        if (item != undefined) return [item];
        return [];
    }

    this.refresh = function () {
        try {
            this.createHtml();
        }
        catch (e) {
            //
        }
    }

    //#endregion
}

MRadioCL.data = [];
MRadioCL.register = function (obj) {
    if (this.data.length == 0) {
        document.addEventListener('click', function (e) {
            MRadioCL.data.forEach(obj => { obj.clickOustside(e); });
            //MSelectCL.data.forEach(obj => { obj.clickOustside(e); });
        });
    }
    this.data.push(obj);
};
MRadioCL.find = function (id) { return this.data.find(x => x.id === id); }
MRadioCL.count = 0;

MRadioCL.stopClick = function (event) {
    event.stopPropagation();
}

MRadioCL.click = function (event, MRadioId, itemId) {
    if (event != null) { event.stopPropagation(); }
    var obj = this.find(MRadioId);
    obj.click(itemId);
};

MRadioCL.filter = function (id) { var obj = this.find(id); obj.filter(); };
MRadioCL.toggle = function (event, id) { var obj = this.find(id); obj.toggle(event); }