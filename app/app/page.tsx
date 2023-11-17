"use client";
import styles from "./Home.module.css";
import Head from "next/head";
import { Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import DataTable from "./components/data_table";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ListGroup from 'react-bootstrap/ListGroup';

import { UseSelector, useSelector } from "react-redux/es/hooks/useSelector";

import { getAllTableNames, getTableData } from "./utils/functions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { table } from "console";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

type RecordType = Record<string, string>;

const Home = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [sideMenuVisible, setSideMenuVisible] = useState("true")
  const [tableNames, setTableNames] = useState([])
  const [insertBox, setInsertBox] = useState(false);
  const [curTableName, setCurTableName] = useState("")
  const [insertElements, setInsertElements] = useState<string[]>([])

  // BROKEN -- trying to use redux
  // const table : any = useAppSelector((state : any) => {state.table})
  // useAppDispatch()
  // console.log("TABLE: ", table)

  const elements = {
    "CHARACTERINFO" : ["CHARACTERID", "COORDINATES", "HEALTH", "OVERALLLEVEL", "MANA", "CHARACTERNAME"],
    "CONTAINS" : ["INVENRORYID", "ITEMID", "INVENTORYQUANTITY"],
    "COORDINATELOCATIONS" : ["COORDINATES","LOCATIONNAME"],
    "DEVELOPS" : ["SKILLNAME", "CHARACTERID", "Level"],
    "FACTIONS" : ["FACTIONNAME", "FACTIONTPYE"],
    "INTERACTIONS" : ["PLAYERCHARACTERID", "NONPLAYABLECHARACTERID", "INTERACTIONTIME", "INTERACTIONTYPE"],
    "INVENTORY" : ["INVENORYID", "PLAYABLECHARACTERID", "INVENTORYSIZE"],
    "ITEM" : ["ITEMID", "ITEMNAME"],
    "LOCATION" : ["LOCATIONNAME", "LOCATIONTYPE"],
    "MEMBEROF" : ["CHARACTERID", "FACTIONNAME"],
    "NONPLAYABLECHARACTER" : ["CHARACTERID", "PERSONALITY"],
    "PLAYER" : ["CHARACTERID", "INVENTORYID"],
    "QUESTREWARDS" : ["QUESTID", "REWARDQUANTITY"],
    "REWARDITEMS" : ["REWARDQUANTITY", "ITEMID"],
    "SKILL" : ["SKILLNAME", "SKILLTYPE"],
    "YIELDSQUEST" : ["QUESTID", "PLAYABLECHARACTERID", "NONPLAYABLECHARACTERID", "INTERACTIONTIME", "QUESTLEVEL"],
  }

  type elementKey = keyof typeof elements;

  const handleTableSelection = (tableName : elementKey) => {
    const info = elements[tableName];
    if (info) {
      setInsertElements(info);
    } else {
      setInsertElements([]);
    }
  };


  useEffect(() => {
    getAllTableNames()
      .then((res:any) => {
        console.log("success:", res)
        setTableNames(res)
      })
      .catch((err) => {
        console.log(err)
      })

  }, [])

  async function setMainTable(table_name: string) {
    try {
      let data : any = await getTableData(table_name)
      setResult(data)
    } catch (err) {
      console.error("ERROR: ", err)

    }
    


  }

  const postRequest = async () => {
    console.log("query: " + query);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query }),
    };
    console.log("sending post request");
    await fetch(
      "https://www.students.cs.ubc.ca/~afahimi/index.php",
      requestOptions
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setResult(data);
      })
      .catch((error) => console.error("Error:", error));
  };



  return (
    <>
      <div className={styles.container}>
        <div className="flex h-full w-full">
          <div className="bg-slate-200 h-full mr-3">
            <h1 className={`p-5 text-3xl font-onest text-slate-950 ${sideMenuVisible ? '' : "hidden"}`}>
              Database Query 
            </h1>
            <ListGroup as={"ul"}>
              {
                tableNames.map((tableName:any, count) => {
                  return (
                  <ListGroup.Item key={count} as={"li"} className="mt-2" onClick={() => {
                      setMainTable(tableName.TABLE_NAME)
                      setCurTableName(tableName.TABLE_NAME)
                      handleTableSelection(tableName.TABLE_NAME)}}>
                      {tableName.TABLE_NAME}
                  </ListGroup.Item>)
                })
              }
            </ListGroup>


            
          </div>
          
          <div>
            <div className={styles.btn_group}>
              <ButtonGroup aria-label="Basic example">
                <Button 
                  variant="outline-primary"
                  onClick = {() => setInsertBox(!insertBox)}
                  >INSERT</Button>
                <Button variant="outline-primary">DELETE</Button>
                <Button variant="outline-primary">UPDATE</Button>
                <Button variant="outline-primary">SELECT</Button>
                <Button variant="outline-primary">PROJECT</Button>
                <Button variant="outline-primary">JOIN</Button>
                <Button variant="outline-primary">AGGREGATION</Button>
              </ButtonGroup>
            </div>
            <div className={styles.form}>
              <Form>
                <Form.Group>
                  {insertBox ? (
                    <>
                      {insertElements.map((element, count) => {
                        return (<Form.Control
                          key = {count}
                          type="text"
                          placeholder={element}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        );
                      })}
                    </>
                    ) : (
                      <Form.Control
                      type="text"
                      placeholder="Enter query"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    )}
                </Form.Group>
              </Form>
            </div>
            <Button onClick={postRequest} variant="outline-primary">
              Execute Query
            </Button>
            <div className={styles.table}>
              {result && <DataTable data={result} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
