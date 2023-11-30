import { OPERATORS } from "../utils/constants";
import { Dropdown, Form } from "react-bootstrap";
import { useState } from "react";

export default function WhereHaving(props: any) {
  // in format ['attribute', 'operator', 'value']
  const [whereClauses, setWhereClauses] = useState<any[]>([
    { attr: "", op: "", val: "", andOr: "" },
  ]);

  const AND_OR = ["AND", "OR"];

  function handleFormChange(index: number, key: string, e: any) {
    let oldOrAnd = whereClauses[index][key];
    let values = [...whereClauses];
    if (e == "equals") {
        e = "="
    } 
    if (e == "not equals") {
        e = "<>"
    }
    values[index][key] = e;
    setWhereClauses(values);
    //console.log(whereClauses, oldOrAnd) 
    if (key == 'andOr' && oldOrAnd.length == 0) {
      addOrAnd();
    }

    updateWhereClauses();

  }

  function addOrAnd() {
    console.log("adding or and");
    let newfield = { attr: "", op: "", val: "", andOr: "" };

    setWhereClauses((old) =>[...old, newfield]);
  };

  function updateWhereClauses() {
    let res = ""
    let attrs = []
    for (let i = 0; i < whereClauses.length; i++) {
      let clause = whereClauses[i];
      if (clause.op == "equals") {
        clause.op = "="
      } else if (clause.op == "not equals") {
        clause.op = "<>"
      }
      if (clause.attr.includes("NAME") || clause.attr.includes("COORDINATES")) {
        res += clause.attr + " " + clause.op + " '" + clause.val + "' " + clause.andOr + " ";
      } else {
        res += clause.attr + " " + clause.op + " " + clause.val + " " + clause.andOr + " ";
      }
      
      attrs.push(clause.attr)
    }
    if (props.setAttrs != undefined) {
      props.setAttrs(attrs)
    }
    //console.log(res)
    props.setOutputStr(res);
  }

  return (
    <div>
      <Form>
        {whereClauses.map((input, index) => {
          return (
            <div key={index} className="flex gap-2 items-center">
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {input.attr}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(props.tableAttrributes).map((attr: any) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={attr}
                          onClick={(val) => handleFormChange(index, 'attr', attr)}
                        >
                          {attr}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {input.op}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(OPERATORS).map((op) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={op}
                          onClick={(e) => handleFormChange(index, 'op', op)}
                        >
                          {op}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
              <Form.Control
                type="text"
                placeholder="Enter condition"
                value={input.val}
                onChange={(e) => handleFormChange(index, 'val', e.target.value)}
              />

              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {input.andOr}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(AND_OR).map((elem: any) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={(e) => handleFormChange(index, 'andOr', elem)}
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          );
        })}
      </Form>
    </div>
  );
}
