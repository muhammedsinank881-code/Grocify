import React, { useEffect, useState } from 'react'

const Task = ({setState}) => {

    // function a () {
    //     return("hiiiiiii")
    // }

    // function b (a){
    //     console.log(a);
        
    // }

    // b(a())

    const onclick =()=>{
        setState("this will run")
    }

    const [input , setInput] = useState("")
    const spli = input.split(",")
    const [show , setShow ] = useState()

    useEffect(()=>{

        const odd =[]

        for(let k = 0 ; k<spli.length; k++){
            if (spli[k] %2 === 1){
                odd.push(spli[k])
            }
        }

        console.log(odd);
         var max = odd[0]
        
        for(let i = 0 ; i<odd.length ; i++){
           
           for(let j = 0 ; j<odd.length ; j++){
            if(odd[i] > odd[j]){
                max = odd[i]
            }
           }
        }
        setShow(max)

        const leng = odd.length -1
        
        
    },[input])
    


  return (
    <div>
      <button onClick={onclick}>
        click
      </button>

      <div>
        <input type="text" 
        value={input}
        onChange={(e)=> setInput(e.target.value)}/>
      </div>
      {show}
    </div>
  )
}

export default Task
