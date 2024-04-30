import React, { useEffect } from 'react'

export default function useOnClickOutside(ref,handler){
    useEffect(() => {
        const listener = (event) => {
            //if nothing is clicked/touched  inside the ref element, do nothing
            if(!ref.current || ref.current.contains(event.target)){
                return;
            }
            handler(event);
        }

        //adding the event listeners on document for mousedown and touchstart events
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart,',listener)

        //cleanup function to remove the event listeners when the component unmounts or when the ref/handler dependencies change
        return () => {
            document.removeEventListener('mousedown',listener);
            document.removeEventListener('touchstart', listener);
        }
    },[ref,handler]) //the useEffect will run only when the ref or the handler will change
}
