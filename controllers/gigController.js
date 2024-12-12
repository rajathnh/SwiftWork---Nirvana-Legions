const Gig = require('../models/Gig');
const Client = require('../models/client');
const Freelancer = require('../models/freelancer'); // Add this import for validation
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const upload = require('../middleware/multer')
const cloudinary = require('cloudinary')
// Create a new gig

const createGig = async (req, res) => {
    console.log("♨️♨️♨️♨️♨️♨️", req.body);
    const { title, description, budget, deadline,skillsRequired } = req.body;
    // req.body.client = req.user.userId;
    const gig = await Gig.create(req.body);
    res.status(StatusCodes.CREATED).json({ gig });
};

// Get all gigs
const getAllGigs = async (req, res) => {
    const gigs = await Gig.find({})
        .populate({ path: 'client', select: 'name' })
        .select('title description budget deadline skillsRequired status'); // Include skillsRequired in the response

    res.status(StatusCodes.OK).json({ gigs, count: gigs.length });
};


// Get a single gig by ID
const getGigById = async (req, res) => {
    const { id: gigId } = req.params;

    const gig = await Gig.findById(gigId)
        .populate({
            path: 'proposals',
            populate: {
                path: 'freelancer',
                select: 'name email _id',
            },
            select: 'proposalMessage bidAmount freelancer',
        })
        .populate('client', 'name email')
        .populate('assignedFreelancer', 'name email')
        .select('title description budget deadline skillsRequired status submissions'); // Include skillsRequired

    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }

    res.status(StatusCodes.OK).json({
        gig,
        proposals: gig.proposals,
        freelancer: gig.assignedFreelancer,
    });
};


// Update a gig
const updateGig = async (req, res) => {
    const { id: gigId } = req.params;

    if (req.body.skillsRequired && (!Array.isArray(req.body.skillsRequired) || req.body.skillsRequired.length === 0)) {
        throw new CustomError.BadRequestError('Please provide valid required skills');
    }

    const gig = await Gig.findOneAndUpdate(
        { _id: gigId, client: req.user.userId },
        req.body,
        { new: true, runValidators: true }
    );
    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }
    res.status(StatusCodes.OK).json({ gig });
};

// Delete a gig
const deleteGig = async (req, res) => {
    const { id: gigId } = req.params;

    const gig = await Gig.findOneAndDelete({ _id: gigId, client: req.user.userId }); // Ensure only the owner can delete
    if (!gig) {
        throw new CustomError.NotFoundError(`No gig found with id: ${gigId}`);
    }
    res.status(StatusCodes.OK).json({ msg: 'Gig deleted successfully' });
};

// Get gigs for a single client
const getSingleClientGigs = async (req, res) => {
    const { id: clientId } = req.params;
    const gigs = await Gig.find({ client: clientId });
    res.status(StatusCodes.OK).json({ gigs, count: gigs.length });
};

// Accept a proposal and assign a freelancer to the gig
const acceptProposal = async (req, res) => {
    const { gigId, proposalId, freeLancerID } = req.body;
    console.log("♨️acceptProposol LOGS♨️", req.body);

    try {
        // Find the gig
        const gig = await Gig.findById(gigId);
        if (!gig) {
            throw new CustomError.NotFoundError('Gig not found');
        }

        // Check if the freelancer exists
        console.log("♨️freelancer ID ♨️", freeLancerID);
        const freelancer = await Freelancer.findById(freeLancerID);
        if (!freelancer) {
            throw new CustomError.NotFoundError('Freelancer not found');
        }

        // Check if the gig is already assigned
        if (gig.status === 'assigned') {
            throw new CustomError.BadRequestError('Gig is already assigned');
        }

        // Update the gig details
        gig.status = 'assigned'; // Update status
        gig.assignedFreelancer = freeLancerID; // Set the assigned freelancer

        await gig.save();

        // Populate the updated gig with freelancer details
        const updatedGig = await Gig.findById(gigId).populate('assignedFreelancer', 'name email');

        res.status(StatusCodes.OK).json({
            message: 'Proposal accepted and gig assigned successfully',
            gig: updatedGig,
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message || 'Error assigning the gig' });
    }
};
const uploadFileSafely = async (file, folder = 'freelancer-submissions') => {
    if (!file) return null; // If no file, return null (or you can set a default message)
    try {
      // Upload any file to Cloudinary (not just images)
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: 'auto', // auto-detects file type (image, video, document, etc.)
        use_filename: true,
        folder: folder,
      });
      return result.secure_url; // Return the uploaded file's URL
    } catch (error) {
      console.error('Error uploading file:', error.message);
      return null; // Return null if upload fails
    }
  };
  
  // Endpoint for freelancers to submit final files for a gig
  const submitFinalWork = async (req, res) => {
    try {
        const gigId = req.params.id;
        const { message } = req.body;

        // Fetch gig by ID
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ msg: 'Gig not found' });
        }

        // Ensure the submissions array exists
        if (!gig.submissions) {
            gig.submissions = [];
        }

        // Extract files array from req.files
        let files = req.files?.files || [];
        if (!Array.isArray(files)) {
            files = [files]; // Convert single file to array
        }

        console.log('Received files:', files); // Log the received files

        // Upload files to Cloudinary
        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: 'gig-submissions',
                });
                console.log('File uploaded:', result); // Log the result of each file upload
                return result.secure_url; // Return the uploaded file URL
            })
        );

        // Create submission object
        const submission = {
            files: uploadedFiles,
            message,
            submittedAt: new Date(),
        };

        // Push submission to the gig
        gig.submissions.push(submission);
        gig.status = 'approval pending';
        console.log('Updated gig status:', gig.status); // Log the updated status
        await gig.save();

        res.status(200).json({ msg: 'Final work submitted successfully', submission });
    } catch (error) {
        console.error('Error submitting final work:', error.message);
        res.status(500).json({ msg: 'File submission failed', error: error.message });
    }
};

const setGigToCompleted = async (req, res) => {
    const { id: gigId } = req.params;
  
    try {
      const gig = await Gig.findById(gigId);
  
      if (!gig) {
        return res.status(404).json({ message: `No gig found with ID: ${gigId}` });
      }
  
      // Update the status to "completed"
      gig.status = "completed";
      await gig.save();
  
      res.status(200).json({
        message: "Gig status updated to completed successfully",
        gig,
      });
    } catch (error) {
      console.error("Error updating gig status:", error);
      res.status(500).json({ message: "Error updating gig status" });
    }
  };
  
  const getRelevantGigs = async (req, res) => {
    try {
        // Fetch the freelancer ID from the URL parameters
        const freelancerId = req.params.id;

        // Log the freelancer ID for debugging
        console.log(`Fetching gigs for freelancer ID: ${freelancerId}`);

        // Fetch freelancer's profile to get the skills
        const freelancer = await Freelancer.findById(freelancerId);

        if (!freelancer) {
            console.log(`Freelancer not found for ID: ${freelancerId}`);
            return res.status(404).json({ message: 'Freelancer not found.' });
        }

        if (!freelancer.skills || freelancer.skills.length === 0) {
            return res.status(400).json({ message: 'No skills found in freelancer profile.' });
        }

        // Log the freelancer's skills for debugging
        console.log(`Freelancer skills: ${freelancer.skills}`);

        // Ensure skills are in the correct format (lowercase)
        const skills = freelancer.skills.map(skill => skill.toLowerCase());
        console.log(`Formatted Freelancer skills: ${skills}`);

        // Find gigs that match any of the freelancer's skills (case insensitive)
        console.log('Running query to find relevant gigs...');
        const gigs = await Gig.find({
            skillsRequired: { $in: skills.map(skill => new RegExp(`^${skill}$`, 'i')) }
        }).populate('client', 'name'); // Populate client details if referenced

        // Log the raw results of the query
        console.log('Raw query results:', JSON.stringify(gigs, null, 2));

        // Log the number of gigs found
        console.log(`Number of gigs found: ${gigs.length}`);

        // Log the skillsRequired of each gig for debugging
        gigs.forEach(gig => {
            console.log(`Gig ID: ${gig._id}, Skills Required: ${gig.skillsRequired}`);
        });

        // Fetch all gigs and log their skillsRequired
        const allgigs = await Gig.find({});
        allgigs.forEach(gig => {
            console.log(`All Gig ID: ${gig._id}, Skills Required: ${gig.skillsRequired}`);
        });

        res.status(200).json({
            status: 'success',
            count: gigs.length,
            gigs
        });
    } catch (err) {
        console.error('Failed to fetch gigs:', err); // Log the complete error
        res.status(500).json({ message: 'Failed to fetch gigs', error: err.message });
    }
};

module.exports = {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    getSingleClientGigs,
    acceptProposal,
    submitFinalWork,
    setGigToCompleted,
    getRelevantGigs,
};