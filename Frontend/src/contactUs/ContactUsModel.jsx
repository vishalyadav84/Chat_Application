import React from 'react';
import ContactForm from './ContactForm';

const ContactUsModal = ({ onClose }) => {
  const handleEmailClick = () => {
    const mailtoLink = `mailto:vishal.2325mca1068@kiet.edu?subject=Inquiry&body=Dear Vishal,`;
    window.open(mailtoLink);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 shadow-4xl">
      <div className="bg-white p-6 rounded-lg shadow-md   max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl  font-bold">Contact the Developer</h1>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div>
          <p className="mb-4 text-slate-800">
            Hi there! I'm Vishal Yadav, a passionate full-stack developer
            with expertise in MERN stack development. I have years of experience
            in building robust and scalable web applications using MongoDB,
            Express.js, React, and Node.js.
          </p>
          <p className="mb-4 text-slate-800">
            If you have any questions, suggestions, or potential projects in
            mind, feel free to reach out to me. I'm always excited to discuss
            new ideas and collaborate on exciting projects.
          </p>
          <div className=''>
            <h3>Other Developers:</h3>
            <table className='flex flex-col gap-y-3 p-4 text-center'>
                <tr>
                    <td>Shubhanshu Mohan</td>
                    <td className=' text-blue-800 underline px-4'>shubhanshu.2325mca11@kiet.edu</td>
                </tr>
                <tr>
                    <td>Sumit Singh</td>
                    <td className=' text-blue-800 underline px-4'>sumit.2325mca1141@kiet.edu</td>
                </tr>
            </table>
          </div>
          <span>If There is any Issue then Mail me by Clicking on Mail.<br/></span>   
          <ContactForm/>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              
           
            <span className="text-blue-500 cursor-pointer p-2" onClick={handleEmailClick}>
              vishal.2325mca1068@kiet.edu
            </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsModal;