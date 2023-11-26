import { OPERATORS } from "../utils/constants"
import { Dropdown, Form } from "react-bootstrap";

export default function WhereHaving(props : any) {


    return (
        <div>
            {(props.isWhere) ? "WHERE" : "HAVING"}
            <Form>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                {props.opStates[0]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from(props.tableAttrributes).map((attr : any) => {
                  return (
                    <>
                      <Dropdown.Item
                        key={attr}
                        onClick={() => props.setOpStates((old : any) => [attr, old[1]])}
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
                {props.op}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from(OPERATORS).map((op) => {
                  return (
                    <>
                      <Dropdown.Item
                        key={op}
                        onClick={() => props.opSetVal(op)}
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
              value={props.opStates[1]}
              onChange={(e) => props.setOpStates((old : any) => [old[0], e.target.value])}
            />
          </Form>
        </div>
    )
}