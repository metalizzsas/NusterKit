export function getCookie(doc: Document, cookieName: string): string | null {

    //parsing document.cookie
    const cookies = doc.cookie.split(';');

    for (let i = 0; i < cookies.length; i++)
    {
        const cookie = cookies[i];

        const [name, value] = cookie.split('=');
        if (name === cookieName)
            return value;
    }
    return null;
}