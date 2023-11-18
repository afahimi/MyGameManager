"use client";
import styles from "./Home.module.css";
import Head, { defaultHead } from "next/head";
import { Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import DataTable from "./components/data_table";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ListGroup from "react-bootstrap/ListGroup";

import { UseSelector, useSelector } from "react-redux/es/hooks/useSelector";

import { getAllTableNames, getTableData } from "./utils/functions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { table } from "console";
import { OracleServerRequest } from "./utils/functions.ts";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

type RecordType = Record<string, string>;

const Home = () => {
  const [query, setQuery] = useState<Record<string, string>>({});
  const [executeQuery, setExecuteQuery] = useState<string>("");
  const [defaultQuery, setDefaultQuery] = useState("");
  const [result, setResult] = useState([]);
  const [sideMenuVisible, setSideMenuVisible] = useState("true");
  const [tableNames, setTableNames] = useState([]);
  const [curTableName, setCurTableName] = useState("");
  const [operation, setOperation] = useState<string>("");

  const operations = [
    "INSERT",
    "DELETE",
    "UPDATE",
    "SELECT",
    "PROJECT",
    "JOIN",
    "AGGREGATION",
  ];
  /* Make all query boxes independent */
  const handleInputChange = (fieldName: string, value: string) => {
    console.log(defaultQuery);
    setQuery((prevQuery) => ({
      ...prevQuery,
      [fieldName]: value,
    }));
  };

  /* Given the values generate a query to execute and toss it to postRequest */
  const handleExecuteQuery = async () => {
    switch (operation) {
      case "SELECT":
        break;
    }
  };

  useEffect(() => {
    getAllTableNames()
      .then((res: any) => {
        console.log("success:", res);
        setTableNames(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  async function setMainTable(table_name: string) {
    setCurTableName(table_name);
    try {
      let data: any = await getTableData(table_name);
      setResult(data);
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  const createFormControlElements = () => {
    if (result.length === 0) {
      return null;
    }

    const keys = Object.keys(result[0]);

    return keys.map((key, index) => {
      return (
        <Form.Control
          key={index}
          type="text"
          placeholder={key}
          onChange={(e) => handleInputChange(key, e.target.value)}
        />
      );
    });
  };

  interface OperationUI {
    [key: string]: JSX.Element;
  }  

  const operationUI: OperationUI = {
    "SELECT": (
      <>
        <Form>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter query"
              value={defaultQuery}
              onChange={(e) => setDefaultQuery(e.target.value)}
            />
          </Form.Group>
        </Form>
      </>
    ),

    "INSERT": (
      <>
        <Form>
          <Form.Group>{createFormControlElements()}</Form.Group>
        </Form>
      </>
    ),
  };

  return (
    <>
      <div className={styles.container}>
        <div className="flex h-full w-full">
          <div className="bg-slate-200 h-full mr-3">
            <h1
              className={`p-5 text-3xl font-onest text-slate-950 ${
                sideMenuVisible ? "" : "hidden"
              }`}
            >
              Database Query
            </h1>
            <ListGroup as={"ul"}>
              {tableNames.map((tableName: any, count) => {
                return (
                  <ListGroup.Item
                    key={count}
                    as={"li"}
                    className="mt-2"
                    onClick={() => {
                      setMainTable(tableName.TABLE_NAME);
                    }}
                  >
                    {tableName.TABLE_NAME}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>

          <div>
            <div className={styles.btn_group}>
              <ButtonGroup aria-label="Basic example">
                {operations.map((operation, count) => {
                  return (
                    <Button
                      key={count}
                      variant="outline-primary"
                      onClick={() => {
                        setOperation(operation);
                      }}
                    >
                      {operation}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
            <div className={styles.form}>
              {operationUI[operation] ? operationUI[operation] : null}
            </div>
            <Button onClick={handleExecuteQuery} variant="outline-primary">
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
