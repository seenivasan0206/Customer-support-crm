import React, {useState} from "react";

function Customers(){
  var [search, setSearch]=useState('');

  var[showForm, setShowForm]= useState(false);

  var [name,setName]=useState('');
  var [phNo, setphNo]=useState('');
  var [Email, setEmail]=useState('');

  var [customers, setCustomers]=useState([
    {name: 'Muvendhan', phNo:'9876543210', Email:'muvendhan@gmail.com'},
    {name: 'Shiva', phNo:'75647292197', Email:'shiva@gmail.com'}
  ]);

  var filteredCustomers=
  customers.filter((customer) => {
    return customer.name.toLowerCase().includes(search.toLowerCase());
  });

  function addCustomer(){
    var newCustomer={
      name: name,
      phNo: phNo,
      Email: Email
    };
    setCustomers([...customers, newCustomer]);
    
    setName('');
    setphNo('');
    setEmail('');
    setShowForm(false);
  }

  function deleteCustomer(phone){
    var updatedCustomers= customers.filter((customer)=>{
      return customer.phNo !==phone;
    });
    setCustomers(updatedCustomers);
  }

  return(
    <div className="customers-page">
      <h1>Customer Mangement</h1>
      <button onClick={()=> setShowForm(true)}>Add customer</button>
      {showForm && (
          <div className="add-customer">
           <h2>Add Customer</h2>
           <input type="text" placeholder="Customer name" value={name} onChange={(event)=> setName(event.target.value)} />
           <input type="text" placeholder="Customer phNo" value={phNo} onChange={(event)=> setphNo(event.target.value)}/> 
           <input type="text" placeholder="Customer Email" value={Email} onChange={(event)=> setEmail(event.target.value)}/>
            <button onClick={addCustomer}>Save</button>
          </div>
        )
      }

      <input type="text" placeholder="seach customer" 
        value={search}
        onChange={(event)=>
        setSearch(event.target.value)
        }
      />

      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>ph.no</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
      </thead>

          <tbody>
            {filteredCustomers.map((customer)=>(
            <tr key={customer.phNo}>
              <td>{customer.name}</td>
              <td>{customer.phNo}</td>
              <td>{customer.Email}</td>
              <td>
                <button onClick={()=> deleteCustomer(customer.phNo)}>Delete</button>
              </td>
            </tr>
            ))}
          </tbody>
        
      </table>
    </div>
  );
}

export default Customers;