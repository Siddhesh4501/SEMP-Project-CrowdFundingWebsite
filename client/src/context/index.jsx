import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const abi =
    [
      {
        "type": "function",
        "name": "campaigns",
        "inputs": [
          {
            "type": "uint256",
            "name": "",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "type": "address",
            "name": "owner",
            "internalType": "address"
          },
          {
            "type": "string",
            "name": "title",
            "internalType": "string"
          },
          {
            "type": "string",
            "name": "description",
            "internalType": "string"
          },
          {
            "type": "uint256",
            "name": "target",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "deadline",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "amountCollected",
            "internalType": "uint256"
          },
          {
            "type": "string",
            "name": "image",
            "internalType": "string"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "createCampaign",
        "inputs": [
          {
            "type": "address",
            "name": "_owner",
            "internalType": "address"
          },
          {
            "type": "string",
            "name": "_title",
            "internalType": "string"
          },
          {
            "type": "string",
            "name": "_description",
            "internalType": "string"
          },
          {
            "type": "uint256",
            "name": "_target",
            "internalType": "uint256"
          },
          {
            "type": "uint256",
            "name": "_deadline",
            "internalType": "uint256"
          },
          {
            "type": "string",
            "name": "_image",
            "internalType": "string"
          }
        ],
        "outputs": [
          {
            "type": "uint256",
            "name": "",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "donateToCampaign",
        "inputs": [
          {
            "type": "uint256",
            "name": "_id",
            "internalType": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "getCampaigns",
        "inputs": [],
        "outputs": [
          {
            "type": "tuple[]",
            "name": "",
            "components": [
              {
                "type": "address",
                "name": "owner",
                "internalType": "address"
              },
              {
                "type": "string",
                "name": "title",
                "internalType": "string"
              },
              {
                "type": "string",
                "name": "description",
                "internalType": "string"
              },
              {
                "type": "uint256",
                "name": "target",
                "internalType": "uint256"
              },
              {
                "type": "uint256",
                "name": "deadline",
                "internalType": "uint256"
              },
              {
                "type": "uint256",
                "name": "amountCollected",
                "internalType": "uint256"
              },
              {
                "type": "string",
                "name": "image",
                "internalType": "string"
              },
              {
                "type": "address[]",
                "name": "donators",
                "internalType": "address[]"
              },
              {
                "type": "uint256[]",
                "name": "donations",
                "internalType": "uint256[]"
              }
            ],
            "internalType": "struct CrowdFunding.Campaign[]"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "getDonators",
        "inputs": [
          {
            "type": "uint256",
            "name": "_id",
            "internalType": "uint256"
          }
        ],
        "outputs": [
          {
            "type": "address[]",
            "name": "",
            "internalType": "address[]"
          },
          {
            "type": "uint256[]",
            "name": "",
            "internalType": "uint256[]"
          }
        ],
        "stateMutability": "view"
      },
      {
        "type": "function",
        "name": "numberOfCampaigns",
        "inputs": [],
        "outputs": [
          {
            "type": "uint256",
            "name": "",
            "internalType": "uint256"
          }
        ],
        "stateMutability": "view"
      }
    ]
const { contract } = useContract('0x5FbDB2315678afecb367f032d93F642f64180aa3', abi);

  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();
    
  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign([
        address, // owner
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime(), // deadline,
        form.image
      ])

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    const data = await contract.call('donateToCampaign', pId, { value: ethers.utils.parseEther(amount)});

    return data;
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', pId);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }


  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);