import React,{useState} from "react";

function Agents(){

  var [search, setSearch]= useState('');


  var[showForm, setShowForm]=useState(false);
  var [name,setName]=useState('');
  var [email,setEmail]=useState('');
  var [role, setRole]=useState('');

  var [agents, setAgents]=useState([
    {name: 'Muvendhan', email:'arun@gmail.com', role:'sse'},
    {name: 'Shiva', email:'shiva@gmail.com', role:'ppe'}
  ]);

  var filteredAgents=agents.filter((agent)=>{
    return agent.name.toLowerCase().includes(search.toLowerCase());
  });

  function addAgent(){
    var newAgent={
      name: name,
      email:email,
      role: role
    };
    setAgents([...agents,newAgent]);
    setName('');
    setEmail('');
    setRole('');
    setShowForm(false);
  }

  function deleteAgent(email){
    var updatedAgents=agents.filter((agent)=>{
      return agent.email !==email;
    });
    setAgents(updatedAgents);
  }

  return(

    <div className="agents-page">
      <h1>Agent Management</h1>
      <button onClick={()=> setShowForm(true)}>Add Agent</button>
      {
        showForm &&(
          <div className="add-agent">
            <input type="text" placeholder="Agent Name" value={name} onChange={(event)=> setName(event.target.value)}/>
            <input type="text" placeholder="Agent Email" value={email} onChange={(event)=> setEmail(event.target.value)}/>
            <input type="text" placeholder="Agent Role" value={role} onChange={(event)=> setRole(event.target.value)}/>
            <button onClick={addAgent}>save</button>
          </div>
        )
      }

      <input type="text" placeholder="Search Agent" value={search} onChange={(event)=> setSearch(event.target.value)}/>

      <table>
        <thead>
          <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Action</th>
        </tr>
        </thead>

        <tbody>
            {filteredAgents.map((agent)=>(
            <tr key={agent.email}>
              <td>{agent.name}</td>
              <td>{agent.email}</td>
              <td>{agent.role}</td>
              <td><button onClick={()=> deleteAgent(agent.email)
              }>Delete</button></td>
            </tr>   
            ))}         
        </tbody>

      </table>

    </div>
  );
}



export default Agents;