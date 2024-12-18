(function() {
    'use strict';
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const patchEvents = function() {
        class BypassEvent {
            constructor(event) {
                this.type = event.type;
                this.bubbles = event.bubbles || false;
                this.cancelable = event.cancelable || false;
                this.defaultPrevented = false
                this.propagationStopped = false
                this.target = event.target
                this.which = event.which
                this.currentTarget = event.currentTarget
            }

            preventDefault() {
                this.defaultPrevented = true;
            }

            stopPropagation() {
                this.propagationStopped = true;
            }


            get isTrusted() {
                return true // 1488iq
            }
        }

        EventTarget.prototype.addEventListener = function(type, listener, options){
            const wrappedListener = function(event) {
                const newEvent = new BypassEvent(event);
                listener.call(this, newEvent);
            };
            originalAddEventListener.call(this, type, wrappedListener, options);
        };
    }

    const getText = function (node) {
        let text = '';

        if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const style = getComputedStyle(node);

            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                node.childNodes.forEach(childNode => {
                    text += getText(childNode);
                });
            }
        }

        return text;
    }

    const AutoCompleteHack = function (speed) {
        var index = 0
        var text = getText(document.getElementById("typefocus")) + getText(document.getElementById("afterfocus"))
        text = text.replaceAll("c", "с").replaceAll("B", "В").replaceAll("y", "у").replaceAll("e", "е").replaceAll("a", "а").replaceAll("T", "Т").replaceAll("o", "о").replaceAll("p", "р").replaceAll("O", "О").replaceAll("H", "Н")
        console.log("[Klavohack] AutoComplete Start!")
        document.getElementById('main-block').appendChild(Object.assign(document.createElement('span'), { textContent: "[KlavoHack] Старт" }));
        document.getElementById('main-block').appendChild(document.createElement('br'))
        let loop = setInterval(function(){
            if(index < text.length) {
                document.getElementById("inputtext").value = document.getElementById("inputtext").value + text[index]
                document.getElementById("inputtext").dispatchEvent(new KeyboardEvent("keyup", { key: text[index], bubbles: true }));
                index++;
            } else {
                console.log("[Klavohack] AutoComplete Stop!")
                document.getElementById('main-block').appendChild(Object.assign(document.createElement('span'), { textContent: "[KlavoHack] Финиш" }));
                clearInterval(loop)
            }
        }, 1000/(speed/60))
    }
    const AutoCompleteHackWERRORS = function (speed, errors) {
        let i = 0
        let loop = setInterval(function(){
            if(i < errors) {
                document.getElementById("inputtext").value = document.getElementById("inputtext").value + ".";
                document.getElementById("inputtext").dispatchEvent(new KeyboardEvent("keyup", { key: ".", bubbles: true }));
                document.getElementById("inputtext").value = "";
                document.getElementById("inputtext").dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace", bubbles: true }));
                i++;
            } else {
                AutoCompleteHack(speed)
                clearInterval(loop)
            }
        }, 50)
    }
    const drawACMenu = function() {
        let aCform = document.createElement('form');
        let aCspeed = document.createElement('input');
        let aCerrors = document.createElement('input');
        let aCBstart = document.createElement('button');

        aCspeed.type = 'number';
        aCspeed.name = 'speed';
        aCspeed.min = '0';
        aCspeed.step = '1';
        aCspeed.placeholder = 'Скорость Зн/м';
        aCerrors.type = 'number';
        aCerrors.name = 'errors'
        aCerrors.min = '0';
        aCerrors.step = '1';
        aCerrors.placeholder = ''
        aCBstart.type = 'submit';
        aCBstart.textContent = 'Старт';

        aCform.appendChild(aCspeed);
        aCform.appendChild(aCerrors)
        aCform.appendChild(aCBstart);

        document.getElementById('main-block').appendChild(aCform);
        originalAddEventListener.call(aCform, 'submit', function(event) {
            event.preventDefault()
            document.getElementById('main-block').appendChild(Object.assign(document.createElement('span'), { textContent: "[KlavoHack] Ожидание" }));
            document.getElementById('main-block').appendChild(document.createElement('br'))
            const racing_time = document.getElementById('racing_time');
            const observer = new MutationObserver(() => {
                if (racing_time.textContent === '00:00') {
                    if(aCerrors.valueAsNumber == 0) {
                        AutoCompleteHack(aCspeed.valueAsNumber)
                    } else {
                        AutoCompleteHackWERRORS(aCspeed.valueAsNumber, aCerrors.valueAsNumber)
                    }
                    observer.disconnect();
                }
            });
            observer.observe(racing_time, { childList: true });
        });
    }
    patchEvents(); // сыро, капчи и там какой то кам в angular ломается

    document.addEventListener('DOMContentLoaded', function(event){
        if(document.getElementById('head')) {
            document.getElementById('head').appendChild(Object.assign(document.createElement('span'), { textContent: "KlavoHack work! created by neoruzzz🤍", style: "margin-left: 30px;" }));
        } 
        if(document.getElementById('main-block')) {
            drawACMenu();
        }
    })
})();