import Table from "react-bootstrap/Table";

interface DataTableProps {
  data: string;
}

const DataTable = (data: DataTableProps) => {
  
  const keys = Object.keys(data["data"][0]);

  const populateTable = () => {
    const result = [];
    for (let i = 0; i < data["data"].length; i++) {
      let values = Object.values(data["data"][i]);
      let items = [];
      for (let j = 0; j < values.length; j++) {
        items.push(<td>{values[j]}</td>);
      }
      result.push(items);
    }
    return result.map((obj, index) => {
      return <tr key={index}>{...obj}</tr>;
    });
  };


  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {keys.map((obj, index) => {
            return <th key={index}>{obj}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {populateTable()}
      </tbody>
    </Table>
  );
};
export default DataTable;
