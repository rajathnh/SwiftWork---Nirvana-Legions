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
const getAllClients = async(req,res) =>{
  const clients = await Client.find({}).populate('gigs')
  res.status(StatusCodes.OK).json({clients,count:clients.length})
}

const getClientById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the client by ID
      const client = await Client.findById(id).populate({path:'gigs',select:'title description budget'});
      if (!client) {
        throw new CustomError.NotFoundError('Client not found');
      }
  
      res.status(StatusCodes.OK).json({
        client: {
          id: client._id,
          name: client.name,
          email: client.email,
          gigs: client.gigs,
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
  
      await client.deleteOne();
  
      res.status(StatusCodes.OK).json({ msg: 'Client deleted successfully' });
    } catch (error) {
      res.status(500).json({ msg: 'Server Error', error: error.message });
    }
  };
  

  module.exports = {    
    getAllClients,
    updateClient,
    getClientById,    
    deleteClient,
  };