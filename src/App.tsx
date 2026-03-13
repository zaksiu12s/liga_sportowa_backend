import { useState, useEffect } from "react";
import supabase from "./utils/supabase";

function Page() {
  const [todos, setTodos] = useState<unknown[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      const { data, error } = await supabase.from("todos").select();

      if (error) {
        console.error(error);
        return;
      }

      if (data && data.length > 0) {
        setTodos(data);
      }
    };

    getTodos();
  }, []);

  return (
    <div>
      <ul>
        
      </ul>
    </div>
  );
}

export default Page;
