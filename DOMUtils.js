var DOMUtils = (function () {

    function isNumeric(obj) {
        return "[object Number]" === {}.toString.call(obj) && isFinite(obj);
    }

    function isString(obj) {
        return "[object String]" === {}.toString.call(obj);
    }

    function trim(string) {
        if (string === null || string === undefined) {
            return "";
        }
        if (String.prototype.trim) {
            return String.prototype.trim.call(string);
        } else {
            return string.toString().replace(/^\s+/, "").replace(/\s+$/, "")
        }
    }

    return {
        // 判断DOM节点是否具有指定样式（精确匹配）
        hasExactClass: function (elem, className) {
            var classReg = function (className) {
                return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
            };
            if (!elem) {
                return false;
            }
            // 支持的浏览器版本：Chrome8+/IE10+/FF3.6+/Safari5.1+/Opera11.5+
            if (elem.classList) {
                return elem.classList.contains(className);
            }
            if (elem.className) {
                return classReg(className).test(elem.className);
            }
            return false;
        },
        // 判断DOM节点是否具有指定样式（部分匹配）
        hasClass: function (node, className) {
            if (!node) {
                return false;
            }
            if (node.className && isString(node.className)) {
                return node.className.indexOf(className) > -1;
            }
            return false;
        },

        tree: function (node) {
            var t = [];
            var name = (node.tagName || node.nodeName).toLowerCase();
            while (node) {
                name = (node.tagName || node.nodeName).toLowerCase();
                if ("body" === name || "html" === name) {
                    break;
                }
                t.unshift(node);
                node = node.parentNode;
            }
            return t;
        },
        /**
         * 获取节点属性值
         * @param node
         * @param attr
         * @return {((name: string) => boolean) | string | string}
         */
        getNodeAttr: function (node, attr) {
            return node.hasAttribute && node.getAttribute(attr) || "";
        },
        /**
         * 获取节点在 DOM 树中的路径
         * @param node
         * @return {string}
         */
        nodePath: function (node) {
            var name = (node.tagName || node.nodeName).toLowerCase();
            var id = node.hasAttribute("id") && !node.getAttribute("id").match(/^[0-9]/) && node.getAttribute("id");
            var classNames;
            if ("input" === name && node.hasAttribute("name") && node.getAttribute("name")) {
                classNames = [node.getAttribute("name")];
            } else {
                var cls, e;
                if (cls = node.getAttribute("class")) {
                    e = trim(cls.replace(/(^| )(clear|clearfix|active|hover|enabled|hidden|display|focus|disabled|ng-)[^. ]*/g, ""));
                }
                if (e && e.length) {
                    classNames = e.split(/\s+/).sort();
                }
            }
            var path = "/" + name;
            id && (path += "#" + id);
            if (classNames) {
                var l = classNames.length;
                for (var n = 0; n < l; n++) {
                    path += "." + classNames[n];
                }
            }
            return path;
        },
        /**
         * 获取节点的 XPath（节点在 DOM 树中的路径，并非 XPath 语言定义的路径）
         * @param node
         * @return {string}
         */
        calculateXpath: function (node) {
            var xpath = "";
            if (node.hasAttribute) {
                var nodeTree = this.tree(node);
                var l = nodeTree.length;
                for (var i = 0; i < l; i++) {
                    xpath += this.nodePath(nodeTree[i]);
                }
            }
            return xpath;
        },
        /**
         * 查找最近的指定规则的祖先节点
         * @param node 目标节点
         * @param rule 规则
         * @param deep 最多遍历的深度。默认最大深度100（没有嵌套这么深的dom吧？）
         * @return {*}
         */
        closest: function (node, rule, deep) {
            deep = isNumeric(deep) ? (deep + 1) : 100; //找到第 deep 次的时候，还没有对 node 进行规则校验，所以需要(deep + 1)。
            for (var i = 0; node && i < deep; i++) {
                if (rule(node)) {
                    return node;
                }
                node = node.parentNode;
            }
            return null;
        }
    };
});

if (typeof define === "function" && define.amd) {
    define(function () {
        return DOMUtils;
    });
} else if (typeof module !== "undefined" && module !== null) {
    module.exports = DOMUtils
} else if (typeof angular !== "undefined" && angular !== null) {
    angular.module("DomUtils", [])
        .factory("DomUtils", function () {
            return DOMUtils;
        });
}