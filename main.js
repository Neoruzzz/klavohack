(function() {
    'use strict';
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    function patchEvents() {
        class IQBypassEvent {
            constructor(event) {
                this.type = event.type;
                this.bubbles = event.bubbles || false;
                this.cancelable = event.cancelable || false;
                this.defaultPrevented = false
                this.propagationStopped = false
                this.target = event.target
                this.currentTarget = event.currentTarget
            }

            preventDefault() {
                this.defaultPrevented = true;
            }

            stopPropagation() {
                this.propagationStopped = true;
            }


            get isTrusted() {
                return true // я бы сделал самоминет за такое 1488iq решение
            }
        }

        EventTarget.prototype.addEventListener = function(type, listener, options) {
            const wrappedListener = function(event) {
                const newEvent = new IQBypassEvent(event);
                listener.call(this, newEvent);
            };
            originalAddEventListener.call(this, type, wrappedListener, options);
        };
    }
    function AutoCompleteHack(speed, errors) {

        if (errors != 0) {
            let i = 0
            let loop = setInterval(function(){
                if(i==errors) {
                    clearInterval(loop)
                    return
                }
                document.getElementById("inputtext").value = document.getElementById("inputtext").value + ".";
                document.getElementById("inputtext").dispatchEvent(new KeyboardEvent("keyup", { key: ".", bubbles: true }));
                document.getElementById("inputtext").value = "";
                document.getElementById("inputtext").dispatchEvent(new KeyboardEvent("keyup", { key: "Backspace", bubbles: true }));
                i++;
            }, 1)
        }

        function getVisibleTextFromElement(element) {
            let visibleText = '';

            function getVisibleText(node) {
                let text = '';

                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent;
                }

                if (node.nodeType === Node.ELEMENT_NODE) {
                    const style = getComputedStyle(node);

                    if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                        node.childNodes.forEach(childNode => {
                            text += getVisibleText(childNode);
                        });
                    }
                }

                return text;
            }
            visibleText = getVisibleText(element);

            return visibleText;
        }

        var goida = 0
        var pidoraz = getVisibleTextFromElement(document.getElementById("typefocus")) + getVisibleTextFromElement(document.getElementById("afterfocus"))
        pidoraz = pidoraz.replaceAll("c", "с").replaceAll("B", "В").replaceAll("y", "у").replaceAll("e", "е").replaceAll("a", "а").replaceAll("T", "Т").replaceAll("o", "о").replaceAll("p", "р").replaceAll("O", "О").replaceAll("H", "Н")
        console.log("[Klavohack] AutoComplete Start!")
        document.getElementById('main-block').appendChild(Object.assign(document.createElement('span'), { textContent: "[KlavoHack] Старт" }));
        document.getElementById('main-block').appendChild(document.createElement('br'))
        let loop = setInterval(function(){
            if(goida > pidoraz.length) {
                console.log("[Klavohack] AutoComplete Stop!")
                document.getElementById('main-block').appendChild(Object.assign(document.createElement('span'), { textContent: "[KlavoHack] Финиш" }));
                clearInterval(loop)
                return
            }
            document.getElementById("inputtext").value = document.getElementById("inputtext").value + pidoraz[goida]
            document.getElementById("inputtext").dispatchEvent(new KeyboardEvent("keyup", { key: pidoraz[goida], bubbles: true }));
            goida++;
        }, 1000/(speed/60))
    }
    function autoStart(speed, errors) {
        document.getElementById('main-block').appendChild(Object.assign(document.createElement('span'), { textContent: "[KlavoHack] Ожидание" }));
        document.getElementById('main-block').appendChild(document.createElement('br'))
        const racing_time = document.getElementById('racing_time');
        const observer = new MutationObserver(() => {
            if (racing_time.textContent === '00:00') {
                AutoCompleteHack(speed, errors)
                observer.disconnect();
            }
        });
        observer.observe(racing_time, { childList: true });
    }
    patchEvents();

    document.addEventListener('DOMContentLoaded', function(event){
        let aCform = document.createElement('form');
        let aCspeed = document.createElement('input');
        let aCerrors = document.createElement('input');
        let aCBstart = document.createElement('button');
        aCspeed.type = 'text';
        aCspeed.name = 'speed';
        aCspeed.placeholder = 'Скорость Зн/м';
        aCerrors.type = 'number';
        aCerrors.name = 'errors'
        aCerrors.min = '0';
        aCerrors.step = '1';
        aCerrors.title = 'Число ошибок'
        aCBstart.type = 'submit';
        aCBstart.textContent = 'Старт';

        aCform.appendChild(aCspeed);
        aCform.appendChild(aCerrors)
        aCform.appendChild(aCBstart);
        if(document.getElementById('main-block')) {
            document.getElementById('main-block').appendChild(aCform);
            originalAddEventListener.call(aCform, 'submit', function(event) {
                event.preventDefault()
                autoStart(parseInt(aCspeed.value), aCerrors.valueAsNumber)
            });
        }
    })
})();