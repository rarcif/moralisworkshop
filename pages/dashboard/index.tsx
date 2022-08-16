import { useRouter } from 'next/router';
import React,
{
  useEffect,
  useState
} from 'react';
import { useMoralis } from 'react-moralis';
import Moralis from 'moralis';
import Web3 from 'web3';
import {
  contractABI,
  contractAddress
} from '../../contract';
import styles from '../../styles/dashboard.module.css';
import classnames from 'classnames/bind';
import {
  inputSubmit,
  inputText,
  inputFiles,
  inputName,
  inputDescription
} from '../../utils/input'
import { logo } from '../../utils/logos'
import HooverSpringer from '../../components/HooverSpringer';

// nft interface
interface NFTProps {
  name?: string;
  description?: string;
  file?: any;
}

// global dashboard variables
const cx = classnames.bind(styles);
const web3 = new Web3(Web3.givenProvider);

// dashboard function
const Dashboard: React.FC<any> = (): JSX.Element => {

  // other variables
  const { isAuthenticated, logout, user } = useMoralis();
  const router = useRouter();

  // state variables
  const [name, setName] = useState<any>('');
  const [description, setDescription] = useState<any>('');
  const [file, setFile] = useState<any>(null);

  // authentication 
  useEffect(() => {
    if (!isAuthenticated) router.push('/');
  }, [isAuthenticated]);

  // on submit function
  const onSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      // save image to IPFS
      const file1 = new Moralis.File(file.name, file);
      await file1.saveIPFS();
      const file1url = file1.ipfs();

      // generate metadata and save to ipfs
      const metadata = {
        name,
        description,
        image: file1url,
      };
      const file2 = new Moralis.File(`${name}metadata.json`, {
        base64: Buffer.from(JSON.stringify(metadata)).toString('base64'),
      });
      await file2.saveIPFS();
      const metadataurl = file2.ipfs();
      console.log(metadataurl);
      // interact with smart contract
      const contract = new web3.eth.Contract(contractABI as any, contractAddress);
      const response = await contract.methods
        .mint(metadataurl)
        .send({ from: user?.get('ethAddress') });
      const tokenId = response.events.Transfer.returnValues.tokenId;
      alert(
        `NFT successfully minted. Contract address - ${contractAddress} and Token ID - ${tokenId}`
      );
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className={styles.container}>
      <HooverSpringer />
      <form
        className={styles.form}
        onSubmit={onSubmit}>
        <img
          src={logo}
          className={styles.logo} />
        <div className={cx(
          styles.inputContainer,
          styles.mt1
        )}>
          <input
            type={inputText}
            className={styles.input}
            placeholder={inputName}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={cx(
          styles.inputContainer,
          styles.mt1
        )}>
          <input
            type={inputText}
            className={styles.input}
            placeholder={inputDescription}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={cx(
          styles.uploadContainer,
          styles.mt1
        )}>
          <input
            type={inputFiles}
            className={styles.input}
            onChange={(e: any) => setFile(e.target.files[0])}
          />
        </div>
        <button
          type={inputSubmit}
          className={cx(
            styles.actionBtn,
            styles.mt1
          )}
        >
          Mint now!
        </button>
        <button
          onClick={logout}
          className={cx(
            styles.actionBtnSecondary,
            styles.mt1
          )}
        >
          Logout
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
