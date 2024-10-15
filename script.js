function run() {
    let gradia = new Gradia();
    let editor = document.getElementById("editor");
    let source = editor.children;

    for (let line of source) {
        code = compile(line);
        if (code === null) {
            continue
        }

        let result = gradia.eval(code);
        if (result.trim() != "") {
            let area = document.getElementById("result");
            area.innerHTML = "";
            area.appendChild(reverse(result));
        }
    }
}

function addTips() {
    let target = {
        function: "Function to be called",
        expr: "List of expression to be evaluated",
        list: "List as data to be processed",
        symbol: "Symbol includes variable, function name and its paramater",
        atom: "Atom: any value includes string, number and bool"
    };
    for (let [name, tip] of Object.entries(target)) {
        let functions = document.querySelectorAll(`.${name}`);
        for (let item of functions) {
            addTipsSub(item, tip)
        }
    }
}

function addTipsSub(button, tip) {
    function createTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    button.addEventListener("mouseenter", function() {
        let others = document.querySelectorAll(".tooltip");
        for (let other of others) {
            other.remove()
        }

        const tooltip = createTooltip(tip);
        const rect = button.getBoundingClientRect();

        tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight}px`;
        tooltip.classList.add('show');
    });

    button.addEventListener("mouseleave", function() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
            tooltip.remove();
        }
    });
}

function build() {
    let editor = document.getElementById("editor");
    let source = editor.children;
    let result = [];

    for (let line of source) {
        code = compile(line);
        if (code != null) {
            result.push(code);
        }               
    }

    let elm = document.createElement("div");
    elm.className = "symbol"; elm.innerHTML = result.join("<br>");

    let area = document.getElementById("result");
    area.innerHTML = ""; area.appendChild(elm);
}

function load() {
    const input = document.createElement('input');
    input.type = 'file';　input.accept = 'text/html'; 

    input.addEventListener('change', function(event) {
        const file = event.target.files[0];  
        if (file) {
            const reader = new FileReader(); 
            reader.onload = function(e) {
                const fileContent = e.target.result; 
                document.getElementById("editor").innerHTML = fileContent;
            };
            reader.readAsText(file, 'UTF-8');
        }
    });
    input.click();
}

function save() {
    let text =  document.getElementById("editor").innerHTML;
    let blob = new Blob([text], { type: 'text/html' });
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url; a.download = "s_block.html";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function compile(source) {
    let inner = source.innerText;
    let trimed = inner.trim();
    if (source.className == "expr" || source.className == "list") {
        let list = [];
        let children = source.children;
        for (let item of children) {
            let output = compile(item);
            if (output !== null) {
                list.push(output);
            }    
        }
        return `${ (source.className == "list") ? "'" : "" }(${list.join(" ")})`
    } else if (source.className == "symbol") {
        return trimed;
    } else if (source.className == "function") {
        return `${trimed}:function`;
    } else if (source.className == "atom") {
        if (trimed == "true" || trimed == "false") {
            return `${trimed}:bool`;
        } else if (!isNaN(parseFloat(trimed))) {
            return `${trimed}:number`;
        } else {
            return `"${trimed}":string`;
        }
    } else {
        return null;
    }
}

function reverse(code) {
    let result = document.createElement("div");
    if (
        !isNaN(parseFloat(code)) || 
        (code == "true" || code == "false")
    ) {
        result.className = "atom";
        result.innerHTML = code;
    } else if (code.startsWith(`"`) && code.endsWith(`"`)) {
        code = code.replace(`"`, "");
        code = code.split("").reverse().join("");
        code = code.replace(`"`, "");
        code = code.split("").reverse().join("");
        
        result.className = "atom";
        result.innerHTML = code;
    }

    return result;
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("editor").focus();
    addTips();
});
