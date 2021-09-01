import { PLAYER_ACTIONS } from "../constants/player-actions.js";

function canICheck(roundActions, playerId) {
  // Assert that all participants has placed a bet
  if (roundActions.length < 1) {
    return false;
  }

  const [previousActions, myActionIndex] = getActionsPerformedBetweenPlayerTurn(roundActions, playerId);
  const myPreviousAction = myActionIndex > -1 ? previousActions.splice(myActionIndex, 1)[0] : null;

  const raises = previousActions.filter(action => action.actionType === PLAYER_ACTIONS.RAISE);
  if (raises.length > 0) {
    console.log('Someone has raised, must re-raise, call or fold');
    return false;
  }

  const hasAllChecked = previousActions.every(action => action.actionType === PLAYER_ACTIONS.CHECK);
  if (hasAllChecked && myPreviousAction?.actionType === PLAYER_ACTIONS.CHECK) {
    console.log('Everyone and you has already checked. Available options: raise or fold');
    return false;
  }

  return true;
}

function canICall(roundActions, playerId, bettingValue) {
  // Assert that you are not the first to bet
  if (roundActions.length === 0) {
    console.log('No actions has been performed');
    return false;
  }

  const [previousActions, myActionIndex] = getActionsPerformedBetweenPlayerTurn(roundActions, playerId);
  const myPreviousAction = myActionIndex > -1 ? previousActions.splice(myActionIndex, 1)[0] : null;

  const hasAllCalled = previousActions.every(action => action.actionType === PLAYER_ACTIONS.CALL);
  if (hasAllCalled) {
    console.log('All participants has called, can not call one more time.');
    return false;
  }

  const previousRaise = previousActions.find((roundAction) => roundAction.actionType === PLAYER_ACTIONS.RAISE);
  if (!previousRaise) {
    console.log('No raise to call on was found');
    return false;
  }

  
  let myPreviousRaisevalue =
    myPreviousAction?.actionType === PLAYER_ACTIONS.RAISE ? myPreviousAction.totalValue : 0;
  const subTotalBettingValue = (bettingValue + (myPreviousRaisevalue)) - previousRaise.totalValue;
  if (subTotalBettingValue !== 0) {
    console.log('Betted wrong amount');
    return false;
  }

  return true;
}

function canIRaise(roundActions, playerId, bettingValue) {
  // If no round actions: it is the start of the round, it is ok to raise
  if (roundActions.length === 0) {
    return true;
  }

  const [previousActions, myActionIndex] = getActionsPerformedBetweenPlayerTurn(roundActions, playerId);
  const myPreviousAction = myActionIndex > -1 ? previousActions.splice(myActionIndex, 1)[0] : null;

  const hasAllFolded = previousActions.every(action => action.actionType === PLAYER_ACTIONS.FOLD);
  if (hasAllFolded) {
    console.log('Cant raise if all has folded');
    return false;
  }

  const previousRaise = previousActions.find((roundAction) => roundAction.actionType === PLAYER_ACTIONS.RAISE);
  const hasAllChecked = previousActions.every(action => action.actionType === PLAYER_ACTIONS.CHECK);
  if (hasAllChecked || !previousRaise) {
    console.log('All has checked or you did the last raise, free to raise any amount');
    return true;
  }

  let myPreviousRaisevalue =
    myPreviousAction?.actionType === PLAYER_ACTIONS.RAISE ? myPreviousAction.totalValue : 0;
  const subTotalBettingValue = (bettingValue + (myPreviousRaisevalue)) - previousRaise.totalValue;
  if (subTotalBettingValue <= 0) {
    console.log('Did not bet correct amount');
    return false;
  }

  return true;
}

function canIFold(roundActions) {
  if (roundActions.length === 0) {
    return false;
  }

  const hasAllFolded = roundActions.every(action => action.actionType === PLAYER_ACTIONS.FOLD);
  if (hasAllFolded) {
    console.log('Everyone can not fold');
    return false;
  }

  return true;
}

function getActionsPerformedBetweenPlayerTurn(roundActions, playerId) {
  // Sort the actions from newest to oldest
  roundActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const playerIndex = roundActions.findIndex(action => action.playerId === playerId);
  let endIndex = playerIndex;
  if (endIndex === -1) {
    endIndex = roundActions.length;
  } else {
    endIndex++;
  }

  return [
    roundActions.slice(0, endIndex),
    playerIndex
  ];
}

const rules = { canICheck, canICall, canIFold, canIRaise };
export default rules;