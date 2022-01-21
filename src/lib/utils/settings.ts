
export function loadDarkMode()
{
    const dark = window.localStorage.getItem("dark") == "true";

    console.log("setting darkmode to ", dark);

    if(dark)
        document.getElementsByTagName("html")[0].classList.add("dark");
    else    
        document.getElementsByTagName("html")[0].classList.remove("dark");
}

export function updateDarkMode(value: boolean)
{
    window.localStorage.setItem("dark", "" + value);
    loadDarkMode();
}

export function readDarkMode(): boolean{
    return window.localStorage.getItem("dark") == "true";
}

export function getLang(): string {
    return window.localStorage.getItem("lang") || "en";
}

export function setLang(value: string)
{
    window.localStorage.setItem("lang", value);
}