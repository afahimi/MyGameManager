  export type DivisionQueries = {
    [key: string]: string;
  };

/* Division query */
export const divisionQueries: DivisionQueries = {
  "Select all players who have all items": `
    CREATE OR REPLACE VIEW DIVIDEND AS
    SELECT ITEMID, INVENTORYID, CHARACTERID, HEALTH, OVERALLLEVEL, MANA, CHARACTERNAME, INVENTORYQUANTITY FROM PLAYER
    NATURAL JOIN CHARACTERINFO
    NATURAL JOIN CONTAINS;

    CREATE OR REPLACE VIEW TEMP_DIVIDEND AS
    SELECT DISTINCT INVENTORYID, CHARACTERID, HEALTH, OVERALLLEVEL, MANA, CHARACTERNAME, INVENTORYQUANTITY
    FROM DIVIDEND;

    CREATE OR REPLACE VIEW DIVISOR AS
    SELECT DISTINCT ITEMID FROM ITEM;

    CREATE OR REPLACE VIEW INTERMEDIATE AS
    SELECT * FROM DIVISOR, TEMP_DIVIDEND
    MINUS
    SELECT * FROM DIVIDEND;

    SELECT * FROM TEMP_DIVIDEND
    MINUS
    SELECT INVENTORYID, CHARACTERID, HEALTH, OVERALLLEVEL, MANA, CHARACTERNAME, INVENTORYQUANTITY FROM INTERMEDIATE;
    `,
};
