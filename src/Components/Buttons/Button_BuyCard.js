import React, { useState } from "react";
import Button from "./Button";
import axios from "axios";
import { Config } from "../../js/config";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import CardDetail from "../CardDetail";

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    width: "300px",
    height: "600px",
    backgroundColor: "black",
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    color: "white"
  },
  button: {}
}));

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  };
}

const CardButton = ({ value, user, price, imgUrl }) => {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const onClick = e => {
    const { value } = e.target;
    const user = e.target.name;

    let sender = user;
    let receiver = "Me";

    const sendersItems = localStorage.getItem(sender).split(",");
    const receiversItems = localStorage.getItem(receiver).split(",");

    let CardId = value;

    if (user !== "Me") {
      if (sendersItems.includes(CardId)) {
        let pos = sendersItems.indexOf(CardId);
        let removedItem = sendersItems.splice(pos, 1);
        localStorage.setItem(sender, sendersItems);

        let newArray = [];
        newArray.push(receiversItems);
        newArray.push(removedItem);
        localStorage.setItem(receiver, newArray);
      } else {
        console.log("error");
      }
    }

    axios
      .post(
        `https://api.luniverse.net/tx/v1.0/transactions/buyCards`,
        {
          from: `${Config.walletAddress.user}`,
          inputs: {
            _tokenId: CardId /// 1번 카드를 살때
          }
        },
        {
          headers: {
            "api-key": `${Config.dapp.apiKey}`
          }
        }
      )
      .then(() => {
        alert(`${CardId}번 카드를 샀습니다. 가격: ${price}`);
      })
      .catch(() => {
        alert("실패했습니다");
      });

    axios
      .post(
        `https://api.luniverse.net/tx/v1.0/transactions/purchase`,
        {
          from: `${Config.walletAddress.user}`,
          inputs: {
            receiverAddress: `${Config.walletAddress.pd}`,
            valueAmount: price * 100000000000000000
          }
        },
        {
          headers: {
            "api-key": `${Config.dapp.apiKey}`
          }
        }
      )
      .then(() => {
        setTimeout(() => {
          window.location.href = `http://localhost:3000/profile/Me`;
        }, 2000);
      })
      .catch(() => {
        alert("지불 실패");
        return;
      });
  };

  return (
    <div>
      <Button
        text={"BUY"}
        onClick={onClick}
        size={"buyCard"}
        value={value}
        user={user}
      />
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={handleClose}>
        <div style={modalStyle} className={classes.paper}>
          <CardDetail className={classes.detail} bgPhoto={imgUrl} />
          <h2>카드를 구매하시겠습니까?</h2>
          <Button
            size={"buyCard"}
            text={"Yes"}
            className={classes.button}></Button>
        </div>
      </Modal>
    </div>
  );
};

export default CardButton;
