declare module "better-sqlite3" {
  namespace Database {
    interface Database {
      prepare(sql: string): any;
      exec(sql: string): void;
      close(): void;
      pragma(pragma: string, options?: any): any;
      [key: string]: any;
    }
  }
  function Database(filename: string, options?: any): Database.Database;
  export = Database;
}
