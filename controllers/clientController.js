const Client = require('../models/client')
const bcrypt = require('bcryptjs')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')

const updateClient = async (req,res) =>{
    try{
        const{id} = req.params;
        const {name,email,password} = req.body
        const client = await Client.findById(id);
        if(!client){
            throw new CustomError.NotFoundError('Client not found')
        }
        client.name = name||client.name;
        client.email = email||client.email;
        client.password = password?await bcrypt.hash(password,10):client.password
        await client.save();

        res.status(StatusCodes.OK).json({
            msg:'Client updates successfully',id:client._id,
            name:client.name,email:client.email,
            
            })
        }
    catch(error){
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
}

const getClientById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the client by ID
      const client = await Client.findById(id);
      if (!client) {
        throw new CustomError.NotFoundError('Client not found');
      }
  
      res.status(StatusCodes.OK).json({
        client: {
          id: client._id,
          name: client.name,
          email: client.email,
        },
      });
    } catch (error) {
      res.status(500).json({ msg: 'Server Error', error: error.message });
    }
  }; 

  const deleteClient = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the client by ID
      const client = await Client.findById(id);
      if (!client) {
        throw new CustomError.NotFoundError('Client not found');
      }
  
      await client.remove();
  
      res.status(StatusCodes.OK).json({ msg: 'Client deleted successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Server Error', error: error.message });
    }
  };
  

  module.exports = {    
    updateClient,
    getClientById,    
    deleteClient,
  };