class MySequelize {
  constructor(connect, tableName) {
    this.connection = connect;
    this.table = tableName;
  }

  async create(obj) {
    const sql = `INSERT INTO ${this.table} (${Object.keys(obj).join(
      ","
    )}) VALUES (?) `;
    const values = Object.values(obj);
    try {
      const result = this.connection.query(sql, [values]);
      return result;
    } catch (e) {
      return e;
    }
    /*
           Model.create({
               name: 'test',
               email: 'test@gmail.com',
               password: '123456789',
               is_admin: false
           })
        */
  }

  async bulkCreate(arr) {
    const sql = `INSERT INTO ${this.table} (${Object.keys(arr[0]).join(
      ","
    )}) VALUES ? `;
    const values = arr.map((obj) => Object.values(obj));
    try {
      const result = this.connection.query(sql, [values]);
      return result;
    } catch (e) {
      return e;
    }
    /*
           Model.bulkCreate([
               {
               name: 'test',
               email: 'test@gmail.com',
               password: '123456789',
               is_admin: false
           },
           {
               name: 'test1',
               email: 'test1@gmail.com',
               password: '123456789',
               is_admin: false
           },
           {
               name: 'test2',
               email: 'test2@gmail.com',
               password: '123456789',
               is_admin: true
           },
        ])
        */
  }

  async findAll(options) {
    let sql = `SELECT * FROM ${this.table}`;

    if (options) {
      if (options.attributes) {
        let attributes = options.attributes
          .map((atr) => (Array.isArray(atr) ? `${atr[0]} AS ${atr[1]}` : atr))
          .join(", ");
        sql = `SELECT ${attributes} FROM ${this.table}`;
      }
      if (options.where) {
        let column = Object.keys(options.where)[0];
        let value = Object.values(options.where)[0];
        let whereStatement = ` WHERE ${column}=${
          isNaN(value) ? `'${value}'` : `${value}`
        }`;
        sql += whereStatement; //escape this
      }
      if (options.order) {
        let column = options.order[0];
        let dir = options.order[1];
        sql += ` ORDER BY ${column} ${dir}`; //escape this
      }
      if (options.limit && !isNaN(options.limit)) {
        sql += ` LIMIT ${options.limit}`;
      }
    }
    // console.log(sql);
    try {
      const result = await this.connection.query(sql);
      //   console.log(result[0]);
      return result[0];
    } catch (e) {
      return e;
    }
    /*
        Model.findAll({
            where: {
                is_admin: false
            },
            order: ['id', 'DESC'],
            limit 2
        })
        */
    /*
        Model.findAll({
            include:[
                {
                    table: playlists,             // table yo want to join
                    tableForeignKey: "creator",   // column reference in the table yo want to join
                    sourceForeignKey: "id",       // base table column reference
                }
            ] 
        })
        */
    /*
        Model.findAll({
            where: {
                [Op.gt]: {
                    id: 10
                },                // both [Op.gt] and [Op.lt] need to work so you can pass the tests
                [Op.lt]: {        
                    id: 20
                }
        })
        */
  }

  async findByPk(id) {
    const sql = `SELECT * FROM ${this.table} WHERE id=${id}`;
    try {
      const result = await this.connection.query(sql);

      return result[0]; //returning only the relevant object
    } catch (e) {
      return e;
    }
    /*
            Model.findByPk(id)
        */
  }

  async findOne(options) {
    let sql = `SELECT * FROM ${this.table}`;

    if (options) {
      if (options.attributes) {
        let attributes = options.attributes
          .map((atr) => (Array.isArray(atr) ? `${atr[0]} AS ${atr[1]}` : atr))
          .join(", ");
        sql = `SELECT ${attributes} FROM ${this.table}`;
      }
      if (options.where) {
        let column = Object.keys(options.where)[0];
        let value = Object.values(options.where)[0];
        let whereStatement = ` WHERE ${column}=${
          isNaN(value) ? `'${value}'` : `${value}`
        }`;
        sql += whereStatement; //escape this
      }
      if (options.order) {
        let column = options.order[0];
        let dir = options.order[1];
        sql += ` ORDER BY ${column} ${dir}`; //escape this
      }
      if (options.limit && !isNaN(options.limit)) {
        sql += ` LIMIT ${options.limit}`;
      }
    }
    sql += " LIMIT 1";
    // console.log(sql);

    try {
      const result = await this.connection.query(sql);
      return result[0]; //returning only the relevant object
    } catch (e) {
      return e;
    }
    /*
            Model.findOne({
                where: {
                    is_admin: true
                }
            })
        */
  }

  async update(newDetails, options) {
    let sql = `UPDATE ${this.table} SET `;
    newDetails = Object.keys(newDetails)
      .map((key) => {
        let value = newDetails[key];
        return isNaN(value) ? `${key}='${value}'` : `${key}=${value}`;
      })
      .join(", ");

    sql += newDetails;

    if (options) {
      if (options.where) {
        let opUsed = Reflect.ownKeys(options.where); // All keys including symbols
        let whereClause = " WHERE ";
        //Creating an array containing trios of [key,value,operator]
        let keyValuesOp = opUsed.map((op) =>
          typeof op === "symbol"
            ? [Object.entries(options.where[op]), Symbol.keyFor(op)].flat(2)
            : [op, options.where[op], "="]
        );
        //Converting the array into sql clause: for[id,5,>]->id>5
        whereClause += keyValuesOp
          .map(
            (trio) =>
              `${trio[0]}${trio[2]}${
                isNaN(trio[1]) ? `'${trio[1]}'` : trio[1]
              } AND`
          )
          .join(" ")
          .slice(0, -3);

        sql += whereClause; //Appending the new where clause to the end of our sql statement
      }
    }
    console.log(sql);

    try {
      const result = await this.connection.query(sql);
      return result[0]; //returning only the relevant object
    } catch (e) {
      return e;
    }

    /*
            Model.update( { name: 'test6', email: 'test6@gmail.com' } , {
                where: {                                                      // first object containing details to update
                    is_admin: true                                            // second object containing condotion for the query
                }
            })
        */
  }

  async destroy({ force, ...options }) {
    let sql;
    if (force) {
      sql = `DELETE FROM ${this.table}`;
    } else {
      sql = `UPDATE ${this.table} SET deleted_at="2012-01-01"`;
    }
    let column = Object.keys(options.where)[0];
    let value = Object.values(options.where)[0];
    let whereClause = ` WHERE ${column}=${
      isNaN(value) ? `'${value}'` : `${value}`
    }`;
    sql += whereClause;
    // console.log(sql);

    try {
      const result = await this.connection.query(sql);
      return result[0];
    } catch (e) {
      return e;
    }
    /*
            Model.destroy({
                where: {                                                      
                    is_admin: true                                            
                },
                force: true      // will cause hard delete
            })
        */
    /*
           Model.destroy({
               where: {                                                      
                   id: 10                                           
               },
               force: false      // will cause soft delete
           })
       */
    /*
           Model.destroy({
               where: {                                                      
                   id: 10                                           
               },  // will cause soft delete
           })
       */
  }

  async restore(options) {
    let sql = `UPDATE ${this.table} SET deleted_at=null`;
    if (options) {
      let column = Object.keys(options.where)[0];
      let value = Object.values(options.where)[0];
      let whereClause = ` WHERE ${column}=${
        isNaN(value) ? `'${value}'` : `${value}`
      }`;
      sql += whereClause;
    }
    console.log(sql);

    try {
      const result = await this.connection.query(sql);
      return result[0];
    } catch (e) {
      return e;
    }
    /*
           Model.restore({
               where: {                                                      
                   id: 12                                          
               }
           })
       */
  }
}

module.exports = { MySequelize };
