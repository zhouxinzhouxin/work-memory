let qs = require('querystring');

exports.sendHtml = (res,html) => { //发送HTML响应
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Content-Length','Buffer.byteLength(html)');
    res.end(html);
};
exports.parseReceivedData = (req, cb) => { //解析HTTP POST数据
    var body = '';
    req.setEncoding('utf-8');
    req.on('data', (chunk) => {body += chunk})
    req.on('end', () => {
        let data = qs.parse(body);
        cb(data);
    })
};
exports.actionForm = (id, path, label) =>{ //渲染简单的表单
    let html = '<form method="POST" action="' + path + '">' +
        '<input type="hidden" name="id" value="' + id + '">' +
        '<input type="submit" value="' + label + '" />' +
        '</form>';
    return html;
};

exports.add = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {  //解析HTTP POST数据
        db.query(
            "INSERT INTO work (hours, date, description) " +
            " VALUES (?, ?, ?)",  //添加工作记录的SQL
            [work.hours, work.date, work.description],  //工作记录数据
            function(err) {
                if (err) throw err;
                exports.show(db, res);  //给用户显示工作记录清单
            }
        );
    });
};

exports.delete = function(db, req, res) {
    exports.parseReceivedData(req, function(work) { //解析HTTP POST数据
    db.query(
            "DELETE FROM work WHERE id=?",  //删除工作记录的SQL
            [work.id],  //工作记录ID
            function(err) {
                if (err) throw err;
                exports.show(db, res);  //给用户显示工作记录清单
            }
        );
    });
};

exports.archive = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {  //解析HTTP POST数据
        db.query(
            "UPDATE work SET archived=1 WHERE id=?",  //更新工作记录的SQL
            [work.id],  //工作记录ID
            function(err) {
                if (err) throw err;
                exports.show(db, res);  //给用户显示工作记录清单
            }
        );
    });
};

exports.show = function(db, res, showArchived) {
    var query = "SELECT * FROM work " +  //获取工作记录的SQL
     "WHERE archived=? " +
    "ORDER BY date DESC";
    var archiveValue = (showArchived) ? 1 : 0;
    db.query(
        query,
        [archiveValue],  //想要的工作记录归档状态
        function(err, rows) {
            if (err) throw err;
            var html = (showArchived)
        ? ''
                : '<a href="/archived">Archived Work</a><br/>';
            html += exports.workHitlistHtml(rows);  //将结果格式化为HTML表格
            html += exports.workFormHtml();
            exports.sendHtml(res, html);  //给用户发送HTML响应
        }
    );
};

exports.showArchived = function(db, res) {
    exports.show(db, res, true);  //只显示归档的工作记录
};

exports.workHitlistHtml = function(rows) {
    var html = '<table>';
    for(var i in rows) {  //将每条工作记录渲染为HTML表格中的一行
    html += '<tr>';
        html += '<td>' + rows[i].date + '</td>';
        html += '<td>' + rows[i].hours + '</td>';
        html += '<td>' + rows[i].description + '</td>';
        if (!rows[i].archived) {  //如果工作记录还没归档，显示归档按钮
            html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
        }
        html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
        html += '</tr>';
    }
    html += '</table>';
    return html;
};

exports.workFormHtml = function() {
    var html = '<form method="POST" action="/">' +  //渲染用来输入新工作记录的空白HTML表单
'<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
    '<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
    '<p>Description:<br/>' +
    '<textarea name="description"></textarea></p>' +
    '<input type="submit" value="Add" />' +
    '</form>';
    return html;
};
exports.workArchiveForm = function(id) {  //渲染归档按钮表单
    return exports.actionForm(id, '/archive', 'Archive');
};
exports.workDeleteForm = function(id) {  //渲染删除按钮表单
    return exports.actionForm(id, '/delete', 'Delete');
};