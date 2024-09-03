'use client'
import Link from "next/link";
import { useUser } from "@/app/userContext";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import React, { ChangeEvent, EventHandler, useEffect, useState } from "react";
import axios from "axios";
import Perks from "@/app/components/perks";
import { Constants } from "@/app/constants";
import { constants } from "buffer";



export default function PlacePageForm() {
    const { user, setUser } = useUser();
    const router = useRouter();
    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')
    const [addPhoto, setAddphoto] =  useState<string[]>([]);
    const [photolink,setPhotolink] = useState('')
    const [description,setdescription] = useState('')
    const [perks, setPerks] = useState<string[]>([]);
    const [extraInfo, setExtrainfo] = useState('')
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [maxGuests, setMaxGuests] = useState(1)
    const [price,setPrice] = useState(1)
   const [error , setError] = useState('')
   const [places,setPlaces] = useState<any[]>([]);
   const {blog} = useParams()
   
   if(!user) {
      router.push('/pages/loginpage')

   } 
   
   const inputHeaders = (text: string) => {
    return (
     <>
      {text}
     </>
    );
}
const inputDescription = (text: string) => {
    return (
       <>
       {text}
       </>
    );
}
const preDescription = (headers: string, description?: string) => {
    return (
        <>
            {inputHeaders(headers)}
            {description && inputHeaders(description)}
        </>
    );
};
const HandleTitle = (ev:React.ChangeEvent<HTMLInputElement>) => {
    setTitle(ev.target.value)
}
const HandleAddress = (ev:React.ChangeEvent<HTMLInputElement>) => {
    setAddress(ev.target.value)
}
const HandleDescription = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    setdescription(ev.target.value); // Update state or handle the input value
};
const HandleAddPhoto = (ev:React.ChangeEvent<HTMLInputElement>) => {
    setAddphoto([ev.target.value])
}
const HandlePhotoLink = (ev:React.ChangeEvent<HTMLInputElement>) => {
    setPhotolink(ev.target.value)
}
const HandlePerks = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setPerks([ev.target.value]);
};
const HandleExtraInfo = (ev:React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtrainfo(ev.target.value)
}
const HandleCheckIn = (ev:React.ChangeEvent<HTMLInputElement>) => {
    setCheckIn(ev.target.value)
}
const HandleCheckout = (ev:React.ChangeEvent<HTMLInputElement>) => {
    setCheckOut(ev.target.value)
}
const handleMaxGuests = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(ev.target.value, 10);
    if (!isNaN(value)) {
        setMaxGuests(value);
    }
};
const handlePrice = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(ev.target.value, 10)
    
        setPrice(value);
  
};


const addPhotoByLink = async (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();
   try{
    const response = await axios.post( Constants.url +'upload-by-links', { link: photolink });
    const {data:filename} = response;
   setAddphoto(prev => {

    return [...prev, filename]
   })
   }catch(err) {
    console.log(err)
   }
   setPhotolink('')
};
const uploadPhoto =  (ev:ChangeEvent<HTMLInputElement>) => {
     const files =  ev.target.files;
     const data = new FormData();
     if (files && files.length ) {
       for ( let i = 0; i < files.length; i++ ) {
        data.append('photos', files[i])
       }
     }
    
     axios.post( Constants.url +'uploads',data, {
        headers: {'contentType' : 'multipart/form-data' }
     }).then(response => {
        const filenames = response.data ;
        setAddphoto(prev =>  {
            return [...prev, ...filenames]
        })

       
     })        
}
useEffect(() => {
    if (blog && blog !== "new") {
        axios.get(Constants.url + 'places/' + blog).then(response => {
            const { data } = response;
            setTitle(data.title);
            setdescription(data.description);
            setAddress(data.address);
            setAddphoto(data.photos || []);
            setPerks(data.perks);
            setExtrainfo(data.extraInfo);
            setCheckIn(data.checkIn);
            setCheckOut(data.checkOut);
            setPrice(data.price)
        }).catch(err => {
            console.error("Error fetching place details:", err);
            setError("Error fetching place details");
        });
    }
}, [blog]);

  
  

    const SavePlaces = async () => {
        const placeData = {
          
            user,
            title,
            address,
            photos: addPhoto,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price
        };
         if (blog !== "new") {
             // Update places
             axios.put(Constants.url+'places', {blog, ...placeData})
             console.log(placeData.price)
             router.push('/pages/accountPage')
         } else {
            // new Place
       
            try {
                const response = await axios.post(Constants.url+'places', placeData)
                router.push('/pages/accountPage')
            } catch(err) {
                console.log(err)
            }
             
         }
       
}
const removePhoto = (filename: string) => {
    setAddphoto(prev => prev.filter(photo => photo !== filename));
};

const AddMainPhoto = (filename:string) => {
    const AddPhotos = addPhoto.filter(photo => photo !== filename)
    const newAddedPhotos = [filename, ...AddPhotos]
    setAddphoto(newAddedPhotos)
   
}

 return (
    <form>
                        
    <h2>Title</h2>
    <input type="text"
      value={title}
      onChange={HandleTitle}
    placeholder="title" />
    <input type="text" 
    value={address}
    onChange={HandleAddress} 
    placeholder="Address" />
    <h1>Photos</h1>
    <div className='text-gray-500 text-sm' >
        more = better
    </div>
    <div className='flex' >
        <input type="text" 
        value={photolink}
        onChange={HandlePhotoLink}
        placeholder="Add using a link.... jpg" />
        <button onClick={addPhotoByLink} className='w-auto bg-black text-white border rounded-full px-4' >Add&nbsp;photos</button>
        
    </div>
  
    <div className=' mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6' >
    {addPhoto.length > 0 && addPhoto.map( (link,index ) => (
        
                <div key={index} className='w-full h-48' >
       
    <div>
  
     <div className='relative top-32 left-44 text-white  text-opacity-100' >
     <button onClick={ (ev) => {
        ev.preventDefault()
        removePhoto(link)}} className=' absolute bg-black p-2 rounded-2xl bg-opacity-50' >
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
     </button>
      </div>
<div className='absolute' >
{link !== addPhoto[0] &&  (
    
    <button onClick={(ev) => {
        ev.preventDefault()
        AddMainPhoto(link)
    }}>
   <span className='relative top-36 left-8 text-white'  >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
 <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
</svg></span>
    </button>

   
)}
</div>
<div className='absolute' >
{link == addPhoto[0] &&  (
    
    <button>
   <span className='relative top-36 left-8 text-white' >
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
</svg>
</span>
    </button>

   
)}
</div>

    </div>
       
     
        

                   <img className='rounded-3xl p-5 object-cover h-full w-full' src={ Constants.imageUrl  + link }  alt=""  />
                {/* <div>{link}</div> */}
                </div>
            ))}
           
   
  
   <div>
            
   <label htmlFor="file-upload"  className='flex justify-center border bg-transparent rounded-2xl p-8 text-gray-600' >
            <input id="file-upload" multiple onChange={uploadPhoto} type="file" className='hidden cursor-pointer' />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
<path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
</svg> Upload
        </label>

   </div>
          
          
    </div> <br /> <br />
    <h2>{preDescription('Description','')}</h2>
    <p>{preDescription('', 'description of places')}</p>
    <textarea
     value={description}
      onChange={HandleDescription} 
      className=' w-96 h-96 border border-black' >
        </textarea> <br /> <br />
        <Perks selected={perks} onChange={setPerks} />
    <div>
        <h2 className='text-2xl mt-4' >
        {preDescription("Extra Info","")}
        </h2>
        <p className='text-gray-500 text-sm' >{preDescription('', "houses rules,etc..")}</p>
        <textarea
         value={extraInfo}
         onChange={HandleExtraInfo} 
        /> 
        <h2>Check in & Check out times</h2>
        <p>add check in and check out times </p> <br /><br />
       <div className='grid gap-2 sm:grid-cols-4' >
      
       <div>
       <h3 className='' >check in time</h3>
       <input type="text"
        value={checkIn}
        onChange={HandleCheckIn}
         placeholder="14:00" />
       </div>
        <div>
        <h3 className='' >check out time</h3>
        <input type="text"
        value={checkOut}
        onChange={HandleCheckout}
         placeholder="11:00" />
        </div>
       <div>
       <h3>Max number of guests</h3>
       <input 
       value={maxGuests}
       onChange={handleMaxGuests}
       type="text" />
       
       </div>
       <div>
       <h3>Price per night</h3>
       <input 
       value={price}
       onChange={handlePrice}
       type="text" />
       
       </div>
       </div>
    </div>
    <button className='bg-black text-white w-full px-4 py-2 rounded-full' onClick={SavePlaces}  type="button" >save</button>
   </form>
 )
}