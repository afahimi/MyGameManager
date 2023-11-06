"use client";
import Image from "next/image";

const getRequest = async () => {
  await fetch("http://localhost:3000/utils")
  await fetch("http://localhost:8080/api/home")
    .then((res) => res.json())
    .then((data) => console.log(data));
}


const Home = () => {
  return (
    <div>
      <h1>Amin</h1>
      <button onClick={getRequest}>Click</button>
    </div>
  );
};

export default Home;
