if (top.location != document.location) {
    top.location.href = document.location.href
}
var IE_URL_MAX_LENGTH = 2000;
if (typeof (IS_MOBILE) === "undefined") {
    IS_MOBILE = false
}
var splitDomain = document.domain.split(".");
if (splitDomain.length > 1) {
    document.domain = splitDomain[splitDomain.length - 2] + "." + splitDomain[splitDomain.length - 1]
}
var aurrp = Cookie.read("aurrp");
aurrp = aurrp === null ? true : aurrp === "1";
var shouldUseLikes = Cookie.read("uselikes");
shouldUseLikes = shouldUseLikes === null ? true : shouldUseLikes === "1";
var shouldUseFbLikes;
var contentTop;
var logoElt;
var likeButtonElement = null;
var COMETBackend = new Class({
    Implements: [Options, Events],
    initialize: function (a) {
        this.setOptions(a);
        this.clientID = null;
        this.stopped = false
    },
    connect: function (f, h, d, b, a, e, g) {
        var c = this;
        c.server = f;
        c.stratusNearID = h;
        c.askedQuestion = d;
        c.wantsSpy = b;
        c.canSaveQuestion = a;
        c.fbAccessToken = e;
        c.topics = g;
        subdomainManager.subdomainWindow(f, function (i) {
            c.reqWindow = i;
            c.gotReqWindow()
        })
    },
    resume: function (b, c) {
        var a = this;
        a.server = b;
        a.clientID = c;
        subdomainManager.subdomainWindow(b, function (d) {
            a.reqWindow = d;
            a.getEvents()
        })
    },
    gotReqWindow: function () {
        var a = this;
        var c = a.stratusNearID || "";
        var b = subdomainManager.fixUrl(a.server, "/start?rcs=1&firstevents=1&spid=" + c);
        if (typeof (a.askedQuestion) === "string") {
            b += "&ask=" + encodeURIComponent(a.askedQuestion)
        }
        if (typeof (a.fbAccessToken) === "string") {
            b += "&fbaccesstoken=" + encodeURIComponent(a.fbAccessToken)
        }
        if (a.wantsSpy) {
            b += "&wantsspy=1"
        }
        if (a.canSaveQuestion) {
            b += "&cansavequestion=1"
        }
        if (a.topics && a.topics.length) {
            b += "&topics=" + encodeURIComponent(JSON.encode(a.topics))
        }
        killHeaders(new a.reqWindow.Request.JSON({
            url: b,
            onSuccess: function (d) {
                if (d.clientID) {
                    a.clientID = d.clientID
                } else {
                    a.clientID = d
                }
                a.fireEvent("connectedToServer");
                if (d.events) {
                    a.gotEvents(d.events)
                }
                a.getEvents()
            },
            onFailure: function () {
                a.fireEvent("failedToConnect")
            }
        })).post()
    },
    getEvents: function (a) {
        if (a === undefined) {
            a = 0
        }
        if (this.stopped) {
            return
        }
        if (a > 2) {
            this.fireEvent("connectionDied", "Lost contact with server, and couldn't reach it after 3 tries.");
            this.stopped = true
        }
        var b = this;
        killHeaders(new b.reqWindow.Request.JSON({
            url: subdomainManager.fixUrl(b.server, "/events"),
            onSuccess: function (c) {
                if (b.stopped) {
                    return
                }
                if (c === null) {
                    b.stopped = true;
                    b.fireEvent("connectionDied", "Server was unreachable for too long and your connection was lost.")
                } else {
                    b.gotEvents(c);
                    b.getEvents()
                }
            },
            onFailure: function () {
                setTimeout(function () {
                    b.getEvents(a + 1)
                }, 2500)
            }
        })).post({
            id: this.clientID
        })
    },
    gotEvents: function (b) {
        var a = this;
        $each(b, function (c) {
            switch (c[0]) {
            case "waiting":
                a.fireEvent("waiting");
                break;
            case "connected":
                a.fireEvent("strangerConnected", c[1]);
                break;
            case "gotMessage":
                a.fireEvent("gotMessage", c[1]);
                break;
            case "strangerDisconnected":
                a.stopped = true;
                a.fireEvent("strangerDisconnected");
                break;
            case "typing":
                a.fireEvent("typing");
                break;
            case "stoppedTyping":
                a.fireEvent("stoppedTyping");
                break;
            case "recaptchaRequired":
                a.fireEvent("recaptchaRequired", c[1]);
                break;
            case "recaptchaRejected":
                a.fireEvent("recaptchaRejected", c[1]);
                break;
            case "count":
                onlineCountUpdated(c[1]);
                break;
            case "spyMessage":
                a.fireEvent("spyMessage", [c[1], c[2]]);
                break;
            case "spyTyping":
                a.fireEvent("spyTyping", c[1]);
                break;
            case "spyStoppedTyping":
                a.fireEvent("spyStoppedTyping", c[1]);
                break;
            case "spyDisconnected":
                a.stopped = true;
                a.fireEvent("spyDisconnected", c[1]);
                break;
            case "question":
                a.fireEvent("question", c[1]);
                break;
            case "error":
                a.stopped = true;
                a.fireEvent("error", c[1]);
                break;
            case "commonLikes":
                a.fireEvent("commonLikes", [c[1]]);
                break
            }
        })
    },
    sendMessage: function (a) {
        killHeaders(new this.reqWindow.Request({
            url: subdomainManager.fixUrl(this.server, "/send"),
            data: {
                msg: a,
                id: this.clientID
            }
        })).send()
    },
    typing: function () {
        killHeaders(new this.reqWindow.Request({
            url: subdomainManager.fixUrl(this.server, "/typing"),
            data: {
                id: this.clientID
            }
        })).send()
    },
    stopTyping: function () {
        killHeaders(new this.reqWindow.Request({
            url: subdomainManager.fixUrl(this.server, "/stoppedtyping"),
            data: {
                id: this.clientID
            }
        })).send()
    },
    submitRecaptcha: function (b, a) {
        killHeaders(new this.reqWindow.Request({
            url: subdomainManager.fixUrl(this.server, "/recaptcha"),
            data: {
                id: this.clientID,
                challenge: b,
                response: a
            }
        })).send()
    },
    disconnect: function () {
        killHeaders(new this.reqWindow.Request({
            url: subdomainManager.fixUrl(this.server, "/disconnect"),
            data: {
                id: this.clientID
            }
        })).send();
        this.stopped = true
    },
    stopLookingForCommonLikes: function () {
        killHeaders(new this.reqWindow.Request({
            url: subdomainManager.fixUrl(this.server, "/stoplookingforcommonlikes"),
            data: {
                id: this.clientID
            }
        })).send()
    }
});
var flashCb_socketConnected;
var flashCb_socketGotPacket;
var flashCb_socketClosed;
var flashCb_socketError;

function resetFlashSocketCallbacks() {
    flashCb_socketConnected = function () {};
    flashCb_socketGotPacket = function () {};
    flashCb_socketClosed = function () {};
    flashCb_socketError = function () {}
}
function parseQueryString(g) {
    var a = {};
    var e = g.split("&");
    for (var c = 0; c < e.length; c++) {
        var f = e[c].split("=");
        var b = decodeURIComponent(f[0].replace(/\+/g, " "));
        var d = decodeURIComponent(f[1].replace(/\+/g, " "));
        a[b] = d
    }
    return a
}
function middotify(b) {
    var a = new Element("span");
    for (var c = 0; c < b.length; c++) {
        if (c > 0) {
            a.appendText(" \u2022\u00A0")
        }
        a.grab(b[c])
    }
    return a
}
var FlashSocketBackend = new Class({
    Implements: [Options, Events],
    initialize: function (a) {
        this.setOptions(a);
        this.stopped = false;
        flashCb_socketConnected = this.socketConnected.bind(this);
        flashCb_socketGotPacket = this.socketGotPacket.bind(this);
        flashCb_socketClosed = this.socketClosedPreConnect.bind(this);
        flashCb_socketError = this.socketErrorPreConnect.bind(this)
    },
    connect: function (f, h, d, b, a, e, g) {
        this.stratusNearID = h || "";
        this.askedQuestion = d;
        this.wantsSpy = b || false;
        this.canSaveQuestion = a || false;
        this.fbAccessToken = e;
        this.topics = g;
        $("flash").socketConnect(f, 1365);
        var c = this;
        this.checkFlashIsAliveInterval = setInterval(function () {
            if (!$("flash") || !$("flash").socketConnect) {
                c.fireEvent("connectionDied", "Flash plugin crashed.");
                c.done()
            }
        }, 1000)
    },
    socketClosedPreConnect: function () {
        resetFlashSocketCallbacks();
        this.fireEvent("failedToConnect")
    },
    socketErrorPreConnect: function () {
        resetFlashSocketCallbacks();
        this.fireEvent("failedToConnect")
    },
    socketConnected: function () {
        flashCb_socketClosed = this.socketClosedPostConnect.bind(this);
        flashCb_socketError = this.socketErrorPostConnect.bind(this);
        var a = {
            caps: "recaptcha",
            spid: this.stratusNearID
        };
        if (typeof (this.askedQuestion) === "string") {
            a.ask = this.askedQuestion
        }
        if (typeof (this.fbAccessToken) === "string") {
            a.fbaccesstoken = this.fbAccessToken
        }
        if (this.wantsSpy) {
            a.wantsspy = "1"
        }
        if (this.canSaveQuestion) {
            a.cansavequestion = "1"
        }
        if (this.topics && this.topics.length) {
            a.topics = JSON.encode(this.topics)
        }
        var b = Cookie.read("abtest");
        if (b !== null) {
            a.abtest = b
        }
        $("flash").socketSendPacket("omegleStart", "web-flash?" + Hash.toQueryString(a));
        this.fireEvent("connectedToServer")
    },
    socketGotPacket: function (a, b) {
        b = decodeURIComponent(b);
        switch (a) {
        case "w":
            this.fireEvent("waiting");
            break;
        case "c":
            setFlashSocketsWorkCookie();
            this.fireEvent("strangerConnected", b);
            break;
        case "m":
            this.fireEvent("gotMessage", b);
            break;
        case "d":
            this.done();
            this.fireEvent("strangerDisconnected");
            break;
        case "t":
            this.fireEvent("typing");
            break;
        case "st":
            this.fireEvent("stoppedTyping");
            break;
        case "recaptchaRequired":
            b = parseQueryString(b);
            this.fireEvent("recaptchaRequired", b.publicKey);
            break;
        case "recaptchaRejected":
            b = parseQueryString(b);
            this.fireEvent("recaptchaRejected", [b.publicKey, b.errorCode]);
            break;
        case "count":
            onlineCountUpdated(parseInt(b, 10));
            break;
        case "spyMessage":
            b = parseQueryString(b);
            this.fireEvent("spyMessage", [b.n, b.m]);
            break;
        case "spyTyping":
            this.fireEvent("spyTyping", b);
            break;
        case "spyStoppedTyping":
            this.fireEvent("spyStoppedTyping", b);
            break;
        case "spyDisconnected":
            this.done();
            this.fireEvent("spyDisconnected", b);
            break;
        case "question":
            this.fireEvent("question", b);
            break;
        case "error":
            this.done();
            this.fireEvent("error", b);
            break;
        case "commonLikes":
            this.fireEvent("commonLikes", [JSON.decode(b)]);
            break;
        case "client_id":
            this.clientID = b;
            break
        }
    },
    socketClosedPostConnect: function () {
        this.fireEvent("connectionDied", "Lost connection with server.");
        this.done()
    },
    socketErrorPostConnect: function (a) {
        if (a) {
            if (a[a.length - 1] != ".") {
                a += "."
            }
        } else {
            a = "internal error."
        }
        this.fireEvent("connectionDied", a);
        this.done()
    },
    sendMessage: function (a) {
        $("flash").socketSendPacket("s", a)
    },
    typing: function () {
        $("flash").socketSendPacket("t", "")
    },
    stopTyping: function () {
        $("flash").socketSendPacket("st", "")
    },
    disconnect: function () {
        $("flash").socketSendPacket("d", "");
        this.done()
    },
    submitRecaptcha: function (b, a) {
        $("flash").socketSendPacket("recaptcha", Hash.toQueryString({
            challenge: b,
            response: a
        }))
    },
    stopLookingForCommonLikes: function () {
        $("flash").socketSendPacket("stoplookingforcommonlikes", "")
    },
    done: function () {
        this.stopped = true;
        if ($("flash") && $("flash").socketClose) {
            $("flash").socketClose()
        }
        resetFlashSocketCallbacks();
        if (this.checkFlashIsAliveInterval) {
            clearInterval(this.checkFlashIsAliveInterval);
            this.checkFlashIsAliveInterval = null
        }
    }
});
var flashSocketsWillWork = Cookie.read("flashsocketswork") === "yes";
var flashSocketsWork = false;

function setFlashSocketsWorkCookie() {
    Cookie.write("flashsocketswork", "yes", {
        duration: 1 / 12
    })
}
function flashCb_socketsWork(b, a) {
    flashSocketsWork = true;
    setFlashSocketsWorkCookie()
}
var MetaBackend = new Class({
    Implements: [Options, Events],
    initialize: function (a) {
        this.setOptions(a);
        self.numResumes = 0;
        self.stopped = false
    },
    plugInBackend: function () {
        var b = ["connectedToServer", "failedToConnect", "waiting", "strangerConnected", "gotMessage", "strangerDisconnected", "typing", "stoppedTyping", "recaptchaRequired", "recaptchaRejected", "spyMessage", "spyTyping", "spyStoppedTyping", "spyDisconnected", "question", "error", "commonLikes"];
        var a = this;
        $each(b, function (c) {
            a.backend.addEvent(c, function () {
                a.stopped = a.backend.stopped;
                a.fireEvent(c, arguments)
            })
        });
        a.backend.addEvent("connectionDied", function () {
            serverManager.unsetKnownGood();
            if (a.backend.clientID && numResumes < 1 && !a.stopped) {
                numResumes++;
                var c = a.backend.clientID;
                a.backend = new COMETBackend();
                a.plugInBackend();
                a.backend.resume(serverManager.pickServer(), c)
            } else {
                a.stopped = true;
                a.fireEvent("connectionDied", arguments)
            }
        })
    },
    connect: function () {
        if (flashSocketsWork && $("flash") && $("flash").socketConnect) {
            this.backend = new FlashSocketBackend()
        } else {
            this.backend = new COMETBackend()
        }
        this.plugInBackend();
        var a = [serverManager.pickServer()];
        for (var b = 0; b < arguments.length; b++) {
            a.push(arguments[b])
        }
        this.backend.connect.apply(this.backend, a)
    },
    sendMessage: function (a) {
        this.backend.sendMessage(a)
    },
    typing: function () {
        this.backend.typing()
    },
    stopTyping: function () {
        this.backend.stopTyping()
    },
    disconnect: function () {
        this.stopped = true;
        this.backend.disconnect()
    },
    submitRecaptcha: function (b, a) {
        this.backend.submitRecaptcha(b, a)
    },
    stopLookingForCommonLikes: function () {
        this.backend.stopLookingForCommonLikes()
    }
});

function startFirstChat() {
    if (IS_MOBILE) {
        logoElt = $("logo");
        $("header").dispose();
        contentTop = 0
    } else {
        contentTop = $("intro").offsetTop
    }
    $("intro").dispose();
    startNewChat.apply(null, arguments)
}
function commify(c) {
    var a = "";
    var b;
    do {
        b = (c % 1000).toString();
        c = Math.floor(c / 1000);
        while (c != 0 && b.length < 3) {
            b = "0" + b
        }
        a = b + a;
        if (c) {
            a = "," + a
        }
    } while (c != 0);
    return a
}
var statusTimeout = null;

function scheduleStatusUpdate() {
    if (statusTimeout !== null) {
        clearTimeout(statusTimeout)
    }
    statusTimeout = setTimeout(updateStatus, 60000)
}
function onlineCountUpdated(a) {
    var b = $("onlinecount");
    if (!b) {
        return
    }
    if (a === undefined || a === null || isNaN(a)) {
        return
    }
    b.set("html", "<strong>" + commify(a) + "</strong> strangers online");
    if ($("onlinecount")) {
        scheduleStatusUpdate()
    }
}
function randomSpyMode() {
    if (Math.random() < 0.25) {
        return "spy"
    } else {
        return "spyee"
    }
}
var idealSpyMode = randomSpyMode();
var firstStatusUpdate = true;

function updateStatus() {
    onlineCountTimeout = null;
    var a = serverManager.pickServer();
    subdomainManager.subdomainWindow(a, function (b) {
        killHeaders(new Request.JSON({
            url: subdomainManager.fixUrl(a, "/status"),
            onSuccess: function (c) {
                onlineCountUpdated(c.count);
                if (c.spyQueueTime < 2 && c.spyeeQueueTime < 2) {
                    idealSpyMode = randomSpyMode()
                } else {
                    if (c.spyQueueTime > c.spyeeQueueTime) {
                        idealSpyMode = "spyee"
                    } else {
                        idealSpyMode = "spy"
                    }
                }
                if (c.timestamp) {
                    timeManager.gotAccurateTime(new Date(c.timestamp * 1000))
                }
                if (c.servers && c.servers.length) {
                    serverManager.setServerList(c.servers)
                }
                firstStatusUpdate = false
            },
            onFailure: function () {
                serverManager.unsetKnownGood();
                setTimeout(updateStatus, 500)
            }
        })).get()
    })
}
function setShouldUseLikes(a) {
    shouldUseLikes = a;
    Cookie.write("uselikes", a ? "1" : "0", {
        duration: 365,
        domain: document.domain
    })
}
function makeShouldUseLikesCheckbox() {
    var a = new Element("label");
    var b = new Element("input", {
        type: "checkbox",
        checked: shouldUseLikes
    });
    b.addEvent("change", function () {
        setShouldUseLikes(b.checked)
    });
    a.grab(b);
    a.appendText(" Find strangers with common interests");
    return a
}
var initOfFbCallbacks = [];
var initOfFbComplete = false;
window.fbAsyncInit = function () {
    FB.init({
        appId: "372387627273",
        cookie: true,
        status: true,
        xfbml: true,
        oauth: true,
        channelUrl: "http://" + document.domain + "/static/channel.html"
    });
    initOfFbComplete = true;
    for (var a = 0; a < initOfFbCallbacks.length; a++) {
        initOfFbCallbacks[a]()
    }
    initOfFbCallbacks = null
};

function onReady() {
    updateStatus();
    if ($("textbtn") === null && $("chatbtn") === null) {
        window.addEvent("load", onReady);
        return
    }($("textbtn") || $("chatbtn")).addEvent("click", function () {
        startFirstChat(false)
    });
    var d = $$("#feedback h2");
    if (location.hash == "#feedback") {
        $("feedback").addClass("expanded");
        $("feedbackmessage").focus()
    } else {
        $("feedback").addClass("collapsed")
    }
    d.addEvent("click", function () {
        if ($("feedback").hasClass("expanded")) {
            $("feedback").removeClass("expanded");
            $("feedback").addClass("collapsed")
        } else {
            $("feedback").removeClass("collapsed");
            $("feedback").addClass("expanded");
            $("feedbackmessage").focus()
        }
    });
    if ($("flashwrapper")) {
        $("flashwrapper").addEvent("mouseleave", function () {
            if ($("flash").mouseOut) {
                $("flash").mouseOut()
            }
        });
        $("flashwrapper").addEvent("mouseenter", function () {
            if ($("flash").mouseOver) {
                $("flash").mouseOver()
            }
        });
        swfobject.embedSWF("/static/omegle.swf?11", "flash", 320, 520, "10.0.0", null, null, null, null, function (f) {
            if (!f.success) {
                $("videobtnstatus").set("html", 'Requires <a href="http://get.adobe.com/flashplayer/">Flash 10</a>.')
            }
        })
    }
    function e() {
        $("tryspymodetext").empty();
        var i = makeSpyOptionsForm(startFirstChat);
        i.form.setStyle("marginTop", "0.5em");
        i.form.setStyle("marginBottom", "0.5em");
        $("tryspymodetext").appendText("Spy mode lets you ask a question and watch two strangers discuss it. (The strangers volunteer to be watched.)");
        $("tryspymodetext").grab(new Element("br"));
        $("tryspymodetext").appendText("Ask anything you like, but try to keep questions open-ended and thought-provoking.");
        $("tryspymodetext").grab(i.form);
        var h = new Element("div");
        var j = new Element("button", {
            text: "Ask strangers"
        });
        j.addEvent("click", i.go);
        h.grab(j);
        $("tryspymodetext").grab(h);
        var f = new Element("div");
        f.setStyle("font-size", "0.9em");
        f.set("text", "Or you can try ");
        var g = new Element("a");
        g.set("text", "discussing questions");
        g.set("href", "javascript:");
        g.addEvent("click", function (k) {
            k.preventDefault();
            startFirstChat(false, null, true, false)
        });
        f.grab(g);
        f.appendText(" instead.");
        $("tryspymodetext").grab(f);
        i.focus()
    }
    function a() {
        $("tryspymodetext").empty();
        $("tryspymodetext").set("html", "Spy mode gives you and a stranger a <strong>random question</strong> to discuss. The question is submitted by a third stranger who can watch the conversation, but can't join in.");
        var g = new Element("button", {
            text: "Check it out!"
        });
        g.addEvent("click", function (i) {
            i.preventDefault();
            startFirstChat(false, null, true, false)
        });
        $("tryspymodetext").grab(new Element("br"));
        $("tryspymodetext").grab(g);
        var f = new Element("div");
        f.setStyle("font-size", "0.9em");
        f.set("text", "Or you can try ");
        var h = new Element("a");
        h.set("text", "asking a question");
        h.set("href", "javascript:");
        h.addEvent("click", function (i) {
            i.preventDefault();
            e()
        });
        f.grab(h);
        f.appendText(" instead.");
        $("tryspymodetext").grab(f)
    }
    if ($("tryspymode")) {
        $("tryspymode").addEvent("click", function c() {
            $("tryspymode").removeEvent("click", c);
            $("tryspymode").removeClass("collapsed");
            if (idealSpyMode == "spy") {
                e()
            } else {
                a()
            }
        })
    }
    var b = makeTopicSettings();
    if ($("topicsettingscontainer")) {
        $("topicsettingscontainer").grab(b)
    }
}
window.addEvent("domready", onReady);

function onLoad() {
    if (IS_MOBILE) {
        setTimeout(function () {
            window.scrollTo(0, 1)
        }, 0)
    }
}
window.addEvent("load", onLoad);
var topicManager = (function () {
    var d = [];
    var b = Cookie.read("topiclist");
    if (b) {
        d = JSON.decode(b)
    }
    function c() {
        Cookie.write("topiclist", JSON.encode(d), {
            duration: 365,
            domain: document.domain
        })
    }
    function a(e) {
        return e.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")
    }
    c();
    return {
        list: function () {
            return d
        },
        add: function (e) {
            var g = a(e);
            if (!g) {
                return false
            }
            for (var f = 0; f < d.length; f++) {
                if (a(d[f]) === g) {
                    return false
                }
            }
            d.push(e);
            c();
            return true
        },
        remove: function (e) {
            var g = a(e);
            for (var f = 0; f < d.length; f++) {
                if (a(d[f]) === g) {
                    d.splice(f, 1);
                    c();
                    return true
                }
            }
            return false
        },
        normalize: a
    }
})();

function makeTopicSettings() {
    var e = new Element("div", {
        "class": "topictageditor"
    });
    var c = new Element("span", {
        "class": "topictagwrapper"
    });
    e.grab(c);

    function j(r) {
        var u = new Element("span", {
            "class": "topictag"
        });
        var s = new Element("span", {
            "class": "topictagtext",
            text: r
        });
        u.grab(s);
        var v = new Element("span", {
            "class": "topictagdelete",
            html: "&times;"
        });
        v.addEvent("click", function () {
            u.destroy();
            topicManager.remove(r);
            a()
        });
        u.grab(v);
        c.grab(u);
        var t = new Element("span");
        t.setStyle("font-size", 0);
        t.appendText(" ");
        c.grab(t)
    }
    $each(topicManager.list(), j);
    var q = new Element("span", {
        "class": "topicplaceholder"
    });
    q.appendText("What are you into?");
    e.grab(q);
    var b = new Element("input", {
        type: "text",
        "class": "newtopicinput"
    });

    function o() {
        a();
        setTimeout(a, 0)
    }
    b.addEvent("keydown", o);
    b.addEvent("keypress", o);
    b.addEvent("keyup", o);

    function p() {
        var t = b.get("value");
        b.set("value", "");
        t = t.split(",");
        t = t.map(function (u) {
            return u.trim()
        });
        for (var s = 0; s < t.length; s++) {
            var r = t[s];
            if (topicManager.add(r)) {
                j(r);
                setShouldUseLikes(true);
                g.set("checked", true)
            }
        }
        a()
    }
    b.addEvent("keydown", function (r) {
        if (r.code === 32 && !b.get("value")) {
            r.preventDefault()
        }
        if (r.code === 13 || r.code === 188) {
            r.preventDefault();
            p()
        }
    });
    b.addEvent("blur", p);
    e.grab(b);
    e.addEvent("click", function () {
        b.focus()
    });
    var h = new Element("div");
    h.grab(e);
    var i = new Element("div");
    i.setStyle("display", "none");
    var k = new Element("label");
    var m = new Element("input", {
        type: "checkbox"
    });
    m.addEvent("click", function (r) {
        if (!m.checked) {
            shouldUseFbLikes = false;
            l(false)
        } else {
            r.preventDefault();
            FB.login(function (s) {
                if (s.authResponse) {
                    shouldUseFbLikes = true;
                    l(true);
                    m.set("checked", true);
                    setShouldUseLikes(true);
                    g.set("checked", true);
                    a()
                }
            }, {
                scope: "user_likes"
            })
        }
        setTimeout(a, 0)
    });
    k.grab(m);
    k.appendText(" Use my Facebook likes");
    i.grab(k);
    h.grab(i);
    var n = new Element("div");
    var d = makeShouldUseLikesCheckbox();
    var g = d.getElement("input");
    n.grab(d);
    h.grab(n);

    function a() {
        if (b.value || topicManager.list().length) {
            q.setStyle("display", "none")
        } else {
            q.setStyle("display", "inline")
        }
        if (m.checked || topicManager.list().length) {
            n.setStyle("display", "block")
        } else {
            n.setStyle("display", "none")
        }
    }
    a();

    function l(r) {
        Cookie.write("fblikes", r ? "1" : "0", {
            duration: 365,
            domain: document.domain
        })
    }
    function f() {
        i.setStyle("display", "block");
        if (shouldUseFbLikes) {
            m.set("checked", true);
            a()
        }
        if (Cookie.read("fblikes") !== "0") {
            FB.getLoginStatus(function (r) {
                if (r.authResponse) {
                    m.set("checked", true);
                    l(true);
                    shouldUseFbLikes = true
                } else {
                    l(false)
                }
                a()
            })
        }
    }
    if (initOfFbComplete) {
        f()
    } else {
        initOfFbCallbacks.push(f)
    }
    return h
}
var subdomainManager = (function () {
    var c = {};
    var a = {};

    function b(e) {
        var d = new Element("iframe", {
            src: "http://" + e + "/static/xhrframe.html",
            width: 0,
            height: 0,
            frameBorder: 0
        });
        d.setStyle("display", "none");
        $(document.body).grab(d)
    }
    return {
        subdomainWindow: function (d, e) {
            if (Browser.Request().withCredentials !== undefined) {
                e(window)
            } else {
                if (c[d]) {
                    e(c[d])
                } else {
                    if (a[d]) {
                        a[d].push(e)
                    } else {
                        a[d] = [e]
                    }
                    b(d)
                }
            }
        },
        fixUrl: function (e, d) {
            if (Browser.Request().withCredentials !== undefined) {
                return "http://" + e + d
            } else {
                return d
            }
        },
        iframeLoaded: function (f, e) {
            if (c[f]) {
                return
            }
            c[f] = e;
            if (a[f]) {
                for (var d = 0; d < a[f].length; d++) {
                    var g = a[f][d];
                    g(e)
                }
                delete a[f]
            }
        }
    }
})();
var serverManager = (function () {
    var d = [];
    var c = null;
    var b = null;
    var a = {
        setKnownGood: function () {
            c = b
        },
        unsetKnownGood: function () {
            c = null
        },
        pickServer: function () {
            if (c !== null && d.indexOf(c) !== -1) {
                return c
            }
            var e = d.shift();
            d.push(e);
            b = e;
            return e
        },
        setServerList: function (e) {
            function g(n) {
                var m, k, l;
                for (m = 1; m < n.length; m++) {
                    k = Math.floor(Math.random() * (1 + m));
                    if (k != m) {
                        l = n[m];
                        n[m] = n[k];
                        n[k] = l
                    }
                }
            }
            g(e);
            for (var f = 0; f < e.length; f++) {
                var h = e[f];
                if (d.indexOf(h) === -1) {
                    d.unshift(h)
                }
            }
            for (var f = 0; f < d.length; f++) {
                var h = d[f];
                if (e.indexOf(h) === -1) {
                    d.splice(f, 1)
                }
            }
        }
    };
    a.setServerList(["front1.omegle.com", "front2.omegle.com", "front3.omegle.com", "front4.omegle.com", "front5.omegle.com"]);
    return a
})();
var timeManager = (function () {
    var a = 0;
    return {
        now: function () {
            var b = new Date();
            b.setTime(b.getTime() + a);
            return b
        },
        gotAccurateTime: function (c) {
            var b = new Date();
            a = c - b
        }
    }
})();
var flashCb_gotNearID;
var flashCb_errorConnectingToStratus;
var flashCb_camAvailable;

function resetStratusCallbacks() {
    flashCb_gotNearID = function () {};
    flashCb_errorConnectingToStratus = function () {}
}
function resetCameraCallbacks() {
    flashCb_camAvailable = function () {}
}
function resetFlashCallbacks() {
    resetStratusCallbacks();
    resetCameraCallbacks()
}
resetFlashCallbacks();
var videoChatEnabled = false;

function flashCb_init(a) {
    if (navigator.userAgent.indexOf("AppleWebKit") === -1) {
        $("flashwrapper").addClass("inited")
    }
    if (a) {
        videoChatEnabled = true;
        $("videobtn").set("src", $("videobtn").get("src").replace("-disabled", "-enabled"));
        $("videobtn").removeClass("disabled");
        $("videobtn").addEvent("click", function () {
            startFirstChat(true)
        });
        $("videobtnstatus").set("html", "&nbsp;")
    } else {
        $("videobtnstatus").set("html", 'Requires a webcam.<br><a target="_blank" href="http://www.amazon.com/mn/search/?_encoding=UTF8&node=172511&tag=omegle-20&linkCode=ur2&camp=1789&brr=1&rd=1&creative=390957">Shop for a webcam here.</a>')
    }
    if (flashSocketsWillWork && $("flash") && $("flash").socketConnect) {
        flashSocketsWork = true
    } else {
        if ($("flash") && $("flash").testSockets) {
            $("flash").testSockets(serverManager.pickServer(), 1365)
        }
    }
}
function killHeaders(a) {
    delete a.headers["X-Requested-With"];
    delete a.headers["X-Request"];
    return a
}
function makeSpyOptionsForm(k, i, j) {
    if (i === undefined) {
        i = ""
    }
    if (j === undefined) {
        j = true
    }
    function e() {
        k(false, d.value, false, h.checked)
    }
    var a = new Element("form");
    a.addEvent("submit", function (l) {
        l.preventDefault();
        e()
    });
    var g = new Element("div");
    var c = new Element("label");
    c.grab(new Element("strong", {
        text: "Enter a question:"
    }));
    c.grab(new Element("br"));
    var d = new Element("input", {
        "class": "questionInput",
        value: i,
        maxlength: 200
    });
    c.grab(d);
    g.grab(c);
    a.grab(g);
    var b = new Element("div");
    b.setStyle("marginTop", "0.5em");
    var f = new Element("label");
    var h = new Element("input", {
        type: "checkbox",
        checked: j
    });
    f.grab(h);
    f.appendText(" I want Omegle to reuse this question if it's good enough.");
    b.grab(f);
    a.grab(b);
    return {
        form: a,
        focus: function () {
            d.focus()
        },
        go: e
    }
}
var flashingInterval = null;

function isFlashing() {
    return flashingInterval !== null
}
function startFlashing() {
    if (isFlashing()) {
        return
    }
    var b = [
        ["___Omegle___", "/static/favicon.png"],
        ["\xAF\xAF\xAFOmegle\xAF\xAF\xAF", "/static/altfavicon.png"]
    ];

    function a() {
        var c = b.pop();
        document.title = c[0];
        setFavicon(c[1]);
        b.unshift(c)
    }
    flashingInterval = setInterval(a, 500);
    a();
    $(document).addEvent("mousemove", mouseMove);
    $(document).addEvent("keydown", stopFlashing);
    $(document).addEvent("focus", stopFlashing);
    $(window).addEvent("mousemove", mouseMove);
    $(window).addEvent("keydown", stopFlashing);
    $(window).addEvent("focus", stopFlashing)
}
var lastCoords = null;

function mouseMove(b) {
    var a = b.page;
    if (lastCoords !== null && (a.x != lastCoords.x || a.y != lastCoords.y)) {
        stopFlashing()
    }
    lastCoords = a
}
function stopFlashing() {
    if (!isFlashing()) {
        return
    }
    clearInterval(flashingInterval);
    flashingInterval = null;
    document.title = "Omegle";
    setFavicon("/static/favicon.png");
    $(document).removeEvent("mousemove", mouseMove);
    $(document).removeEvent("keydown", stopFlashing);
    $(document).removeEvent("focus", stopFlashing);
    $(window).removeEvent("mousemove", mouseMove);
    $(window).removeEvent("keydown", stopFlashing);
    $(window).removeEvent("focus", stopFlashing)
}
function setFavicon(b) {
    var a = $$("link");
    for (var c = 0; c < a.length; c++) {
        if (a[c].rel === "icon") {
            a[c].href = b;
            return
        }
    }
    var d = new Element("link", {
        rel: "icon",
        type: "image/png",
        href: b
    });
    $$("head")[0].grab(d)
}
var currentAffiliate = null;

function startNewChat(ak, v, f, aF) {
    if (IS_MOBILE) {
        setTimeout(function () {
            window.scrollTo(0, 1)
        }, 1000)
    }
    if ($("appstore")) {
        $("appstore").destroy()
    }
    if ($("footer")) {
        $("footer").destroy()
    }
    var L = typeof (v) === "string";
    var X = false;
    var an = false;
    $(document.body).addClass("inconversation");
    if (ak) {
        $(document.body).addClass("videochat")
    }
    var aM = new Element("div", {
        "class": "chatbox3"
    });
    var a = new Element("div", {
        "class": "chatbox2"
    });
    var S = new Element("div", {
        "class": "chatbox"
    });
    if (IS_MOBILE) {
        aM.grab(logoElt)
    }
    var q = new Element("div", {
        "class": "logwrapper",
        styles: {
            top: contentTop + "px"
        }
    });
    var aA = new Element("div", {
        "class": "logbox"
    });
    var K = new Element("div");
    aA.grab(K);
    q.grab(aA);
    var O = new Element("div", {
        "class": "logwrapperpush"
    });
    q.grab(O);
    S.grab(q);
    var C = new Element("div", {
        "class": "controlwrapper"
    });
    var aB = new Element("table", {
        "class": "controltable",
        cellpadding: "0",
        cellspacing: "0",
        border: "0"
    });
    var aw = new Element("tbody");
    var N = new Element("tr");
    var at = new Element("td", {
        "class": "disconnectbtncell"
    });
    var aa = new Element("div", {
        "class": "disconnectbtnwrapper"
    });
    var ab = new Element("button", {
        "class": "disconnectbtn"
    });
    aa.grab(ab);
    at.grab(aa);
    N.grab(at);
    var aI = new Element("td", {
        "class": "chatmsgcell"
    });
    var ac = new Element("div", {
        "class": "chatmsgwrapper"
    });
    if (IS_MOBILE) {
        var ar = new Element("form");
        ar.setStyles({
            margin: 0,
            padding: 0
        });
        ar.addEvent("submit", function (i) {
            i.preventDefault();
            g()
        });
        var ah = new Element("input", {
            "class": "chatmsg disabled",
            disabled: true,
            placeholder: "Type your message..."
        });
        ar.grab(ah);
        ac.grab(ar)
    } else {
        var ah = new Element("textarea", {
            "class": "chatmsg disabled",
            cols: "80",
            rows: "3",
            disabled: true
        });
        ac.grab(ah)
    }
    aI.grab(ac);
    N.grab(aI);
    var o = new Element("td", {
        "class": "sendbthcell"
    });
    var p = new Element("div", {
        "class": "sendbtnwrapper"
    });
    var am = new Element("button", {
        "class": "sendbtn",
        disabled: true,
        text: "Send"
    });
    am.grab(new Element("div", {
        "class": "btnkbshortcut",
        text: "Enter"
    }));
    p.grab(am);
    o.grab(p);
    if (!IS_MOBILE) {
        N.grab(o)
    }
    aw.grab(N);
    aB.grab(aw);
    C.grab(aB);
    S.grab(C);
    a.grab(S);
    aM.grab(a);
    $(document.body).grab(aM);

    function aD() {
        var i = document.activeElement;
        if (!i) {
            return ah.get("disabled")
        }
        var aN = i.nodeName.toLowerCase();
        return aN !== "input" && aN !== "textarea"
    }
    function J(i) {
        if (i.code === 27) {
            i.preventDefault()
        }
        if (!IS_MOBILE && !ah.get("disabled") && (i.code === 8 || i.code == 37 || i.code == 39 || (i.code >= 46 && i.code <= 90) || (i.code >= 96 && i.code <= 111))) {
            ah.focus()
        } else {
            if (i.code === 8 && aD()) {
                i.preventDefault()
            }
        }
    }
    function aG(i) {
        if (i.code === 27) {
            i.preventDefault();
            m()
        }
        if (i.code === 8 && aD()) {
            i.preventDefault()
        }
    }
    if (!IS_MOBILE) {
        $(document).addEvent("keydown", J);
        $(document).addEvent("keyup", aG)
    }
    function ae(i) {
        try {
            return parent[i].apply(null, Array.prototype.slice.call(arguments, 1))
        } catch (aN) {}
    }
    var x = new MetaBackend();
    if (IS_MOBILE) {
        scrollElt = document.body
    } else {
        scrollElt = aA
    }
    function Y() {
        if (IS_MOBILE) {
            return true
        }
        return scrollElt.scrollTop >= scrollElt.scrollHeight - scrollElt.clientHeight
    }
    function b() {
        var i = scrollElt.scrollHeight;
        scrollElt.scrollTop = i
    }
    var s = [];
    var au = false;

    function e(aN) {
        var i = aN.replace(/&/g, "&amp;");
        i = i.replace(/</g, "&lt;");
        i = i.replace(/"/g, "&quot;");
        return i
    }
    function ax(i) {
        i += "-" + $random(1, 10000000000).toString(36);
        return "http://Omegle.com/?from=" + i
    }
    function ap() {
        var aN = '<h1>Chat log from <a href="http://omegle.com/?from=fblog">Omegle</a>:</h1>\n';
        for (var aP = 0; aP < s.length; aP++) {
            var aO = s[aP];
            aN += "<b>" + e(aO[0]) + "</b>";
            if (aO.length > 1) {
                aN += " " + e(aO[1])
            }
            aN += "\n"
        }
        return aN
    }
    function P(i) {
        var aO = JSON.encode(s);
        var aN = "http://logs.omegle.com/generate?log=" + encodeURIComponent(aO);
        if (i) {
            aN += "&host=1"
        }
        return aN
    }
    function F(aP, i) {
        var aN = new Element("form");
        aN.setStyle("display", "none");
        aN.set("target", "_blank");
        aN.set("action", "http://logs.omegle.com/generate");
        aN.set(i);
        aP = aP || {
            host: 1
        };
        var aO = {
            log: JSON.encode(s)
        };
        if (k) {
            aO.topics = JSON.encode(k)
        }
        aO = $extend(aO, aP);
        $each(aO, function (aS, aR) {
            var aQ = new Element("input", {
                type: "hidden",
                name: aR,
                value: aS
            });
            aN.grab(aQ)
        });
        $(document.body).grab(aN);
        aN.submit();
        setTimeout(function () {
            aN.dispose()
        }, 0)
    }
    function R() {
        var aP = 550;
        var i = 420;
        var aO = screen.height;
        var aN = screen.width;
        var aR = Math.round((aN / 2) - (aP / 2));
        var aQ = 0;
        if (aO > i) {
            aQ = Math.round((aO / 2) - (i / 2))
        }
        var aS = ("scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=" + aP + ",height=" + i + ",left=" + aR + ",top=" + aQ);
        window.open("", "intent", aS);
        F({
            tweet: 1
        }, {
            target: "intent"
        })
    }
    var aK = [{
        regex: /horny|\b(finger|spank)\\s+(your?|ur?|m[ey])\b|\b(m[ey]|your?|ur?|hard|tight|wet|dripping|throbbing|huge|big|giant)\s+(tits|boobs|dick|cock|cum|pussy|ass|clit|vag)\b/i,
        url: "http://www.webcamclub.com/landing/?ainfo=Mjk5OTF8Mjl8NDc4&show=monitor&atcc=$",
        text: "Looking for horny girls? You're in the wrong place. Go where the girls are! (18+)",
        trackCode: "505",
        tests: [{
            trackCode: "506",
            percentage: 50,
            style: {
                color: "blue",
                "text-decoration": "underline"
            }
        }],
        noMobile: true
    }];
    for (var M = 0; M < aK.length; M++) {
        if (!aK[M].priority) {
            aK[M].priotity = M
        }
    }
    function y(aP) {
        for (var aO = 0; aO < aK.length; aO++) {
            var aN = aK[aO];
            if ((!IS_MOBILE || !aN.noMobile) && aN.regex.test(aP)) {
                if (currentAffiliate === null || currentAffiliate.priority <= aN.priority) {
                    currentAffiliate = aN
                }
            }
        }
    }
    var T = [];

    function r(aO, aN) {
        var aP = new Element("div", {
            "class": "logitem"
        });
        aP.grab(aO);
        var i = Y();
        if (T.length === 0 || aN) {
            K.grab(aP)
        } else {
            aP.inject(T[0].element, "before")
        }
        if (i) {
            if (IS_MOBILE) {
                setTimeout(b, 10)
            } else {
                b()
            }
        }
        return aP
    }
    function af(aS, aN, aO, aR) {
        if (aN === undefined || aN) {
            startFlashing()
        }
        var aP, aQ;
        if (aR === undefined || (aR && typeof (aR) !== "string")) {
            aP = true;
            aQ = null
        } else {
            if (typeof (aR) === "string") {
                aP = true;
                aQ = aR
            } else {
                aP = false
            }
        }
        if (typeof aS === "string") {
            var i = new Element("p", {
                "class": "statuslog"
            });
            i.appendText(aS);
            if (aQ === null) {
                aQ = aS
            }
        } else {
            var i = new Element("div", {
                "class": "statuslog"
            });
            i.grab(aS)
        }
        if (aP && !au && aQ !== null) {
            s.push([aQ])
        }
        return r(i, aO)
    }
    var D = null;
    var aC = false;

    function d(i) {
        if (typeof (Recaptcha) !== "undefined") {
            Recaptcha.destroy()
        }
        if (D !== null) {
            D.dispose()
        }
        D = r(i);
        initialLogIsRecaptcha = false
    }
    var aE = [];

    function l(i) {
        aE.push(af(i, false))
    }
    function I(aN, i) {
        if (typeof (Recaptcha) !== "undefined") {
            Recaptcha.destroy()
        }
        if (D !== null) {
            D.dispose()
        }
        D = af(aN, false, false, typeof (i) === "undefined" ? false : i);
        initialLogIsRecaptcha = false
    }
    function ad(i, aO, aQ) {
        var aR = new Element("p", {
            "class": aO
        });
        var aP = new Element("strong", {
            "class": "msgsource"
        });
        aP.appendText(i + ":");
        aR.grab(aP);
        aR.appendText(" ");
        var aN = true;
        $each(aQ.split("\n"), function (aS) {
            if (!aN) {
                aR.grab(new Element("br"))
            }
            aN = false;
            aR.appendText(aS)
        });
        r(aR);
        if (!au) {
            s.push([i + ":", aQ])
        }
    }
    function u(aO, aP) {
        if (aO == "you") {
            var i = "youmsg";
            var aN = "You";
            X = true
        } else {
            var i = "strangermsg";
            var aN = "Stranger";
            startFlashing();
            an = true
        }
        aP = aP.trim();
        ad(aN, i, aP);
        if (aO == "stranger" && (aP.indexOf("FBI") !== -1 || aP.toLowerCase().indexOf("federal bureau") !== -1)) {
            af("If the above message says you have been reported to the FBI, it is not legitimate. Please ignore it.")
        }
        if (aO == "stranger" && aP.toLowerCase().indexOf("facebook.com/profile.php?") !== -1 && aP.toLowerCase().indexOf("id=") === -1) {
            af("THE STRANGER DOES NOT KNOW YOUR FACEBOOK INFO. The above link directs anyone to their own profile; it is not really a link to your profile specifically.")
        }
    }
    function aJ(aN) {
        for (var aO = 0; aO < T.length; aO++) {
            if (!aN || T[aO].name === aN) {
                T[aO].element.dispose();
                T.splice(aO, 1);
                break
            }
        }
    }
    function Q() {
        aJ("Stranger")
    }
    function ag(i) {
        aJ(i);
        var aN = af(i + " is typing...", false, true, false);
        T.push({
            name: i,
            element: aN
        })
    }
    function aH() {
        ag("Stranger")
    }
    function V(aO, aP, aN, i) {
        if (aO === undefined) {
            if (j !== null) {
                j.go();
                return
            }
            aO = ak
        }
        if (aO) {
            aP = null;
            aN = false;
            i = false
        }
        if (aP === undefined) {
            aP = v
        }
        if (aN === undefined) {
            aN = f
        }
        if (i === undefined) {
            i = aF
        }
        av();
        if (!aO) {
            G()
        }
        aM.dispose();
        if (aL !== null) {
            clearInterval(aL);
            aL = null
        }
        if (!IS_MOBILE) {
            $(document).removeEvent("keydown", J);
            $(document).removeEvent("keyup", aG)
        }
        startNewChat(aO, aP, aN, i)
    }
    var B = null;

    function av() {
        if (B !== null) {
            clearTimeout(B);
            B = null
        }
    }
    function G() {
        B = null;
        if ($("flash") && $("flash").turnOffCamera) {
            $("flash").turnOffCamera()
        }
    }
    var aL = null;
    var j = null;

    function aq() {
        resetFlashCallbacks();
        aJ();
        au = true;
        if (initialLogIsRecaptcha) {
            Recaptcha.destroy();
            D.dispose();
            D = null;
            initialLogIsRecaptcha = false
        }
        if (U) {
            U.destroy();
            U = null
        }
        for (var bd = 0; bd < aE.length; bd++) {
            aE[bd].dispose()
        }
        mots = [];
        if (ak) {
            if ($("flash").stopChat) {
                $("flash").stopChat()
            }
            B = setTimeout(G, 30000)
        }
        if (!ak && !IS_MOBILE) {
            C.setStyle("margin-right", 0);
            q.setStyle("margin-right", 0);
            new Fx.Tween(C, {
                duration: "short"
            }).start("margin-right", 0, "176px");
            new Fx.Tween(q, {
                duration: "short"
            }).start("margin-right", 0, "176px");
            $("adwrapper2").setStyle("margin-left", "160px");
            new Fx.Tween($("adwrapper2"), {
                duration: "short"
            }).start("margin-left", "160px", 0);
            setTimeout(b, 300)
        }
        $(document.body).removeClass("inconversation");
        $(document.body).removeClass("videochat");
        ah.set("disabled", true);
        ah.addClass("disabled");
        am.set("disabled", true);
        ah.blur();
        am.blur();
        aj("new");
        window.onbeforeunload = null;
        $(window).removeEvent("unload", al);
        stopped = true;
        var aZ = K.get("html");
        var a9 = null;
        if (document.createRange && (window.getSelection || document.getSelection)) {
            a9 = document.createRange();
            a9.selectNodeContents(K)
        }
        if (L) {
            j = makeSpyOptionsForm(V, v, aF);
            r(j.form);
            j.focus()
        }
        var aS = new Element("div");
        var a2 = new Element("input");
        a2.type = "submit";
        a2.value = "Start a new conversation";
        a2.addEvent("click", function () {
            V()
        });
        aS.grab(a2);
        var aQ = new Element("a");
        aQ.set("text", "switch to " + ((ak || f || v) ? "text" : "video"));
        aQ.set("href", "#");
        aQ.addEvent("click", function (i) {
            i.preventDefault();
            if (f || v) {
                V(false, null, false, false)
            } else {
                V(!ak)
            }
        });
        if (f || v || videoChatEnabled) {
            aS.appendText(" or ");
            aS.grab(aQ)
        }
        if ((f || v) && videoChatEnabled) {
            var bc = new Element("a");
            bc.set("text", "video");
            bc.set("href", "#");
            bc.addEvent("click", function (i) {
                i.preventDefault();
                V(true)
            });
            aS.appendText(" or ");
            aS.grab(bc)
        }
        af(aS, false, false);
        if (!f && !v) {
            var be = new Element("div");
            var a4 = makeShouldUseLikesCheckbox();
            if (!shouldUseFbLikes && !topicManager.list().length) {
                a4.getElement("input").set("checked", false);
                a4.getElement("input").set("disabled", true)
            }
            be.grab(a4);
            var a8 = new Element("a", {
                href: "javascript:",
                text: "(Settings)"
            });
            a8.addEvent("click", function (bg) {
                bg.preventDefault();
                if (aN !== null) {
                    aN()
                }
                be.empty();
                var i = makeTopicSettings();
                be.grab(i);
                i.getElement("input").focus()
            });
            be.appendText(" ");
            be.grab(a8);
            r(be)
        }
        var aR = new Element("div", {
            "class": "logsavelinks"
        });
        var a1 = new Element("span", {
            "class": "conversationgreat"
        });
        a1.set("text", "Was this a great chat?");
        a1.addEvent("click", function () {
            F()
        });
        aR.grab(a1);
        var aU = [];
        var aY = P(true);
        var aT = new Element("a");
        aT.set("text", "Get a link");
        aT.set("href", "javascript:");
        aT.addEvent("click", function (i) {
            i.preventDefault();
            F()
        });
        aU.push(aT);
        if (a9 !== null && !IS_MOBILE) {
            var ba = new Element("a", {
                href: "javascript:",
                text: "Select all"
            });
            ba.addEvent("click", function (i) {
                i.preventDefault();
                var bg = window.getSelection ? window.getSelection() : document.getSelection();
                bg.removeAllRanges();
                bg.addRange(a9)
            });
            aU.push(ba)
        }
        var a6 = [];
        var aO = new Element("a", {
            href: "javascript:",
            text: "Facebook"
        });
        aO.addEvent("click", function (bh) {
            bh.preventDefault();
            if (typeof (FB) === "undefined" || !FB.login || !FB.api || Browser.Request().withCredentials === undefined) {
                i();
                return
            }
            function i() {
                F({
                    facebook: 1
                })
            }
            function bi(bj) {
                new Request.JSON({
                    url: "http://logs.omegle.com/generate",
                    onSuccess: function (bk) {
                        if (bk.id) {
                            af("Posted log to Facebook!")
                        } else {
                            if (bk.error) {
                                af("Error: " + bk.error)
                            } else {
                                af("Error posting log to Facebook.")
                            }
                        }
                    },
                    onFailure: function () {
                        af("Error posting log to Facebook.")
                    }
                }).post({
                    log: JSON.encode(s),
                    fbaccesstoken: bj
                })
            }(function bg() {
                FB.login(function (bj) {
                    if (!bj.authResponse) {
                        var bk = new Element("span");
                        bk.set("html", "Paranoid? <strong>It's ok.</strong> You can ");
                        var bl = new Element("a");
                        bl.set("href", "javascript:");
                        bl.set("text", "post the log as a link");
                        bl.addEvent("click", function (bm) {
                            bm.preventDefault();
                            i()
                        });
                        bk.grab(bl);
                        bk.appendText(" without giving Omegle access to your Facebook profile.");
                        af(bk);
                        return
                    }
                    bi(bj.authResponse.accessToken)
                }, {
                    scope: "publish_stream"
                })
            })()
        });
        a6.push(aO);
        var aV = new Element("a", {
            href: "javascript:",
            text: "Tumblr"
        });
        aV.addEvent("click", function (i) {
            i.preventDefault();
            F({
                tumblr: 1
            })
        });
        a6.push(aV);
        var aX = new Element("a", {
            href: "javascript:",
            text: "Twitter"
        });
        aX.addEvent("click", function (i) {
            i.preventDefault();
            R()
        });
        a6.push(aX);
        var a3 = new Element("a", {
            href: "javascript:",
            text: "reddit"
        });
        a3.addEvent("click", function (i) {
            i.preventDefault();
            F({
                reddit: 1
            })
        });
        a6.push(a3);
        aR.appendText(" Save the log: ");
        aR.grab(middotify(aU));
        aR.appendText(" \u2022\u00A0Or post log to: ");
        aR.grab(middotify(a6));
        var aP = aurrp;

        function bb(i) {
            aurrp = i;
            Cookie.write("aurrp", i ? "1" : "0", {
                duration: 365,
                domain: document.domain
            })
        }
        var aN = null;

        function a5() {
            var bm = 3;
            var i = !aP;
            var bg = false;
            var bi = new Element("div");
            var bh = new Element("span");
            bi.grab(bh);
            bi.appendText(" ");
            var bj = new Element("input");
            bj.set("type", "button");
            bj.set("value", "Stop");
            aN = function () {
                if (aL !== null) {
                    clearInterval(aL);
                    aL = null;
                    i = true;
                    bl()
                }
            };
            bj.addEvent("click", function () {
                aN()
            });
            bi.grab(bj);
            var bk = new Element("label");
            bk.setStyle("color", "black");
            bk.setStyle("font-weight", "normal");
            var bn = new Element("input");
            bn.set("type", "checkbox");
            bn.set("checked", aP);
            bn.addEvent("change", function () {
                bb(bn.checked)
            });
            bk.grab(bn);
            bk.appendText(" Auto-reroll next time");

            function bl() {
                if (i) {
                    if (!bg) {
                        bg = true;
                        bh.set("text", "Not automatically rerolling.");
                        bj.dispose();
                        bi.grab(bk);
                        aj("new")
                    }
                } else {
                    var bo = "Automatically rerolling in: " + bm + " second";
                    if (bm != 1) {
                        bo += "s"
                    }
                    bh.set("text", bo);
                    aj("new", bm)
                }
            }
            bl();
            af(bi, false, false);
            if (i) {
                return
            }
            aL = setInterval(function () {
                bm--;
                if (bm < 1) {
                    clearInterval(aL);
                    aL = null;
                    V()
                } else {
                    bl()
                }
            }, 1000)
        }
        if (L || (X && an)) {
            af(aR, false, false)
        } else {
            if (ak) {
                a5()
            }
        }
        if (f && !X) {
            af("Please try to discuss the question, not just disconnect!")
        }
        function bf() {
            if (currentAffiliate === null) {
                return false
            }
            var bm = currentAffiliate;
            if (bm.tests) {
                var br = Math.random() * 100;
                var bp = false;
                for (var bk = 0; bk < bm.tests.length; bk++) {
                    test = bm.tests[bk];
                    if (br < test.percentage) {
                        bp = true;
                        break
                    }
                    br -= test.percentage
                }
                if (bp) {
                    bm = Hash.combine(test, bm)
                }
            }
            var bq = ak ? "video" : "text";
            if (bm.trackCode) {
                bq = bm.trackCode
            }
            if (bm.baseTrackCode) {
                bq = bm.baseTrackCode + "-" + bq
            }
            var bl;
            var bo = new Element("span");
            var bg = bm.url.replace(/\$/g, bq);
            var bn = new Element("a", {
                href: bg,
                target: "_blank"
            });
            bn.setStyles({
                "text-decoration": "none"
            });
            if (bm.image) {
                var bj = new Element("img", {
                    src: bm.image,
                    alt: ""
                });
                bj.setStyles({
                    border: "0 none",
                    "vertical-align": "middle"
                });
                bn.grab(bj);
                bn.appendText(" ")
            }
            if (bm.text) {
                var bi = new Element("span");
                bi.setStyles({
                    color: "#000000",
                    "text-decoration": "none",
                    "font-weight": "normal",
                    background: "#FF0000",
                    padding: "0.25em 0.5em",
                    "border-radius": "0.5em",
                    "-moz-border-radius": "0.5em",
                    "-webkit-border-radius": " 0.5em"
                });
                if (bm.style) {
                    bi.setStyles(bm.style)
                }
                bi.set("text", bm.text);
                bn.grab(bi)
            }
            bo.grab(bn);
            var bh = new Element("span");
            bh.set("html", "&times;");
            bh.setStyles({
                cursor: "default",
                color: "black",
                "font-weight": "bold"
            });
            bh.addEvent("click", function () {
                currentAffiliate = null;
                bl.destroy()
            });
            bo.appendText(" ");
            bo.grab(bh);
            bl = af(bo);
            return true
        }
        bf();
        var a0 = ['<a href="http://bit.ly/RbCtuq" target="_blank">Gary Johnson</a> will legalize weed and bring US troops home. Vote.', '<a href="http://bit.ly/Mt9D5C" target="_blank">Gary Johnson</a> will legalize weed and keep the US out of wars. Vote.'];
        var aW = a0[$random(0, a0.length - 1)];
        var a7 = new Element("span");
        a7.set("html", aW);
        af(a7)
    }
    x.addEvent("connectedToServer", function () {
        ab.set("disabled", false);
        window.onbeforeunload = c;
        $(window).addEvent("unload", al)
    });
    x.addEvent("failedToConnect", function () {
        I("Error connecting to server. Please try again.");
        aq()
    });
    var U = null;
    var A = null;
    var H = false;
    x.addEvent("waiting", function () {
        serverManager.setKnownGood();
        if (L) {
            I("Looking for two strangers. Hang on.")
        } else {
            var aP = new Element("div");
            var aN = new Element("div", {
                text: "Looking for someone you can chat with. Hang on."
            });
            aP.grab(aN);
            if (h) {
                U = new Element("div", {
                    "class": "commonlikescancel",
                    text: "It may take a little while to find someone with common interests. If you get tired of waiting, you can "
                });
                var aO = new Element("a", {
                    href: "javascript:",
                    text: "connect to a completely random stranger"
                });

                function i() {
                    if (A) {
                        clearTimeout(A);
                        A = null
                    }
                    if (!U) {
                        return
                    }
                    x.stopLookingForCommonLikes();
                    U.destroy();
                    U = null
                }
                aO.addEvent("click", i);
                U.grab(aO);
                U.appendText(" instead.");
                aP.grab(U);
                A = setTimeout(function () {
                    H = true;
                    i()
                }, 10000)
            }
            I(aP)
        }
    });
    x.addEvent("strangerConnected", function (i) {
        serverManager.setKnownGood();
        if (ak) {
            $("flash").gotStrangerPeerID(i)
        }
        if (A) {
            clearTimeout(A);
            A = null
        }
        if (L) {
            I("You're now watching two strangers discuss your question!", "You're watching two strangers discuss your question on Omegle!")
        } else {
            I("You're now chatting with a random stranger. Say hi!", "You're chatting with a random stranger on Omegle!");
            if (H) {
                af("Omegle couldn't find anyone who shares interests with you, so this stranger is completely random. Try adding more interests!", false, false, false)
            }
            ah.set("disabled", false);
            ah.removeClass("disabled");
            am.set("disabled", false);
            if (!IS_MOBILE) {
                ah.focus()
            }
        }
    });
    x.addEvent("gotMessage", function (i) {
        Q();
        i = i.replace(/^[\r\n]+/g, "");
        u("stranger", i)
    });
    x.addEvent("strangerDisconnected", function () {
        af("Your conversational partner has disconnected.");
        aq()
    });
    x.addEvent("typing", aH);
    x.addEvent("stoppedTyping", Q);
    x.addEvent("recaptchaRequired", ao);
    x.addEvent("recaptchaRejected", ao);
    x.addEvent("connectionDied", function (aN) {
        var i = "Technical error";
        if (aN) {
            i += ": " + aN + " Sorry. :( Omegle understands if you hate it now, but Omegle still loves you."
        }
        af(i);
        serverManager.unsetKnownGood();
        aq()
    });
    x.addEvent("question", function (i) {
        var aP = new Element("div", {
            "class": "question"
        });
        var aN = new Element("div", {
            "class": "questionHeading",
            text: "Question to discuss:"
        });
        aP.grab(aN);
        var aO = new Element("div", {
            "class": "questionText"
        });
        aO.appendText(i);
        aP.grab(aO);
        s.push(["Question to discuss:", i]);
        r(aP)
    });
    x.addEvent("spyMessage", function (i, aO) {
        if (i === "Stranger 1") {
            var aN = "youmsg"
        } else {
            var aN = "strangermsg"
        }
        aJ(i);
        startFlashing();
        ad(i, aN, aO)
    });
    x.addEvent("spyDisconnected", function (i) {
        af(i + " has disconnected");
        aq()
    });
    x.addEvent("spyTyping", ag);
    x.addEvent("spyStoppedTyping", aJ);
    x.addEvent("error", function (i) {
        af(i);
        aq()
    });
    var E = null;
    var k = null;
    x.addEvent("commonLikes", function (aN) {
        if (!aN.length) {
            return
        }
        k = aN;
        var aP = "You and the stranger both like ";
        for (var aO = 0; aO < k.length; aO++) {
            aP += k[aO];
            if (aO < k.length - 1) {
                aP += ", "
            }
            if (aO == k.length - 2) {
                aP += "and "
            }
        }
        aP += ".";
        if (E) {
            E.destroy()
        }
        E = af(aP)
    });

    function ao(aN) {
        var i = new Element("form");
        i.setStyle("margin", "0");
        i.setStyle("padding", "0");
        i.addEvent("submit", function (aP) {
            aP.preventDefault();
            x.submitRecaptcha(Recaptcha.get_challenge(), Recaptcha.get_response());
            I("Verifying...")
        });
        var aO = new Element("div");
        aO.setStyle("padding-left", "1px");
        aO.setStyle("padding-top", "1px");
        i.grab(aO);
        d(i);
        initialLogIsRecaptcha = true;
        Recaptcha.create(aN, aO, {
            callback: function () {
                Recaptcha.focus_response_field();
                var aQ = new Element("div");
                aQ.setStyle("padding-top", "0.5em");
                var aP = new Element("input");
                aP.set("type", "submit");
                aP.set("value", "Submit");
                aQ.grab(aP);
                i.grab(aQ)
            },
            theme: "clean"
        })
    }
    function al() {
        if (x.stopped) {
            return
        }
        x.disconnect();
        af("You have disconnected.");
        aq()
    }
    function c() {
        var i = "Leaving this page will end your conversation.";
        return i
    }
    var w = "disconnect";

    function m() {
        switch (w) {
        case "disconnect":
            aj("really");
            if (!ah.get("disabled") && !IS_MOBILE) {
                ah.focus()
            }
            break;
        case "really":
            al();
            break;
        case "new":
            V();
            break
        }
    }
    function aj(aN, i) {
        var aO;
        switch (aN) {
        case "disconnect":
            aO = "Disconnect";
            break;
        case "really":
            aO = "Really?";
            break;
        case "new":
            aO = "New";
            break
        }
        if (i !== undefined) {
            aO += " (" + i + ")"
        }
        ab.set("text", aO);
        ab.grab(new Element("div", {
            "class": "btnkbshortcut",
            text: "Esc"
        }));
        w = aN
    }
    am.addEvent("click", g);
    aj("disconnect");
    ab.addEvent("click", m);

    function g() {
        Z();
        if (!IS_MOBILE) {
            ah.focus()
        }
        var i = ah.value;
        if (!i) {
            return
        }
        ah.value = "";
        ay = "";
        u("you", i);
        x.sendMessage(i);
        aj("disconnect");
        y(i)
    }
    var ay = ah.value;
    var ai = null;

    function Z() {
        if (ai !== null) {
            clearTimeout(ai);
            ai = null
        }
    }
    function W() {
        ai = null;
        x.stopTyping()
    }
    ah.addEvent("keydown", function (i) {
        if (i.code == 13 && !(i.shift || i.alt || i.meta)) {
            g();
            i.preventDefault();
            return
        }
    });
    ah.addEvent("keypress", function (i) {
        setTimeout(function () {
            if (ah.value === ay) {
                return
            }
            ay = ah.value;
            if (ai === null) {
                x.typing()
            }
            Z();
            ai = setTimeout(W, 5000)
        }, 0)
    });
    I("Connecting to server...");
    var t = false;
    var z = null;
    var h = false;
    var n = [];
    if (!f && !v && shouldUseLikes) {
        if (shouldUseFbLikes) {
            var az = FB.getAuthResponse();
            z = az ? az.accessToken : null
        }
        n = topicManager.list();
        h = n.length || z !== null
    }
    serverManager.unsetKnownGood();
    if (ak) {
        flashCb_gotNearID = function (i) {
            resetStratusCallbacks();
            x.connect(i, null, false, false, z, n)
        };
        flashCb_errorConnectingToStratus = function () {
            resetStratusCallbacks();
            I("Error connecting to Adobe Stratus. Please try again.");
            aq()
        };
        if ($("flash").startChat) {
            $("flash").startChat()
        }
    } else {
        x.connect(null, v, f, aF, z, n)
    }
};