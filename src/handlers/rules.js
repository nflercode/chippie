import { PLAYER_ACTIONS } from "../constants/player-actions.js";

/**
 * Rule:
 * 
 * Check is allowed if:
 * Everyone has betted
 * No one has raised this turn
 * 
 * @param {Array} roundActions Game Actions for this round
 * @param {Number} numActiveParticipants number of active (not folded) participant in the game
 */
function canICheck(roundActions, playerId) {
  // Assert that all participants has placed a bet
  if (roundActions.length < 1) {
    return false;
  }

  const previousActions = getActionsPerformedBetweenPlayerTurn(roundActions, playerId);

  const myActionIndex = previousActions.findIndex(action => action.playerId === playerId);
  let myAction;
  if (myActionIndex > -1) {
    myAction = previousActions.splice(myActionIndex, 1)[0];
  }

  const raises = previousActions.filter(action => action.actionType === PLAYER_ACTIONS.RAISE);
  if (raises.length > 0) {
    console.log('Someone has raised, must re-raise or call');
    return false;
  }

  const hasAllChecked = previousActions.every(action => action.actionType === PLAYER_ACTIONS.CHECK);
  if (hasAllChecked && myAction?.actionType === PLAYER_ACTIONS.CHECK) {
    console.log('Everyone and you has already checked. Available options: raise or fold');
    return false;
  }

  return true;
}

/**
 * Rule:
 * 
 * Call is allowed if:
 * You are not the first to bet
 * You are betting equally as much as the previous participant
 * 
 * @param {Array} roundActions Game actions for this round
 */
function canICall(roundActions, playerId, bettingValue) {
  // Assert that you are not the first to bet
  if (roundActions.length === 0) {
    console.log('No actions has been performed');
    return false;
  }

  const previousActions = getActionsPerformedBetweenPlayerTurn(roundActions, playerId);
  const playerPreviousActionIndex = previousActions.findIndex(action => action.playerId === playerId);
  let playerPreviousAction;
  if (playerPreviousActionIndex > -1)
    playerPreviousAction = previousActions.splice(playerPreviousActionIndex)[0];

  console.log(previousActions, playerId, 'paction', playerPreviousAction);

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

  const subTotalBettingValue = (bettingValue + (playerPreviousAction?.raisedValue || 0)) - previousRaise.raisedValue;
  console.log(
    'bettingValue',
    bettingValue,
    'playerPrevRaise',
    (playerPreviousAction?.raisedValue || 0),
    'prevRaise',
    previousRaise.raisedValue);
  if (subTotalBettingValue !== 0) {
    console.log('Betted wrong amount');
    return false;
  }

  return true;
}

/**
 * Rule:
 * 
 * Raise is allowed if:
 * Raise is always allowed
 * 
 * @param {Array} roundActions Game actions for this round
 */
function canIRaise(roundActions, playerId, bettingValue) {
  // If no round actions: it is the start of the round, it is ok to raise
  if (roundActions.length === 0) {
    return [true, bettingValue];
  }

  const previousActions = getActionsPerformedBetweenPlayerTurn(roundActions, playerId);
  const playerPreviousActionIndex = previousActions.findIndex(action => action.playerId === playerId);
  let playerPreviousAction;
  if (playerPreviousActionIndex > -1)
    playerPreviousAction = previousActions.splice(playerPreviousActionIndex)[0];

  console.log(previousActions);

  const hasAllFolded = previousActions.every(action => action.actionType === PLAYER_ACTIONS.FOLD);
  if (hasAllFolded) {
    console.log('Cant raise if all has folded');
    return [false, -1];
  }

  const previousRaise = previousActions.find((roundAction) =>
    roundAction.actionType === PLAYER_ACTIONS.RAISE);
  const hasAllChecked = previousActions.every(action => action.actionType === PLAYER_ACTIONS.CHECK);
  if (hasAllChecked || !previousRaise) {
    console.log('All has checked or you did the last raise, free to raise any amount');
    return [true, bettingValue];
  }

  let subTotalBettingValue = (bettingValue + (playerPreviousAction?.raisedValue || 0)) - previousRaise.raisedValue;
  console.log(
    'bettingValue',
    bettingValue,
    'playerPrevRaise',
    (playerPreviousAction?.raisedValue || 0),
    'prevRaise',
    previousRaise.raisedValue,
    subTotalBettingValue);

  if (bettingValue <= 0) {
    console.log('Did not bet correct amount');
    return [false, -1];
  }

  const actualRaisedAmount = (bettingValue - previousRaise.raisedValue);
  return [true, actualRaisedAmount];
}

/**
 * Rule:
 * 
 * Fold is allowed if:
 * You are not the first to bet
 * 
 * @param {Array} roundActions Game actions for this round
 */
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

/**
 * Finds the actions perfromed from last time the player perfromed an action
 * 
 * @param {Array} roundActions all actions performed this round
 * @param {String} playerId id of the player perfroming the action
 * 
 * @returns actions perfromed from last performed action for player
 */
function getActionsPerformedBetweenPlayerTurn(roundActions, playerId) {
  // Sort the actions from newest to oldest
  roundActions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let endIndex = roundActions.findIndex(action => action.playerId === playerId);
  if (endIndex === -1) {
    endIndex = roundActions.length;
  } else {
    endIndex++;
  }

  return roundActions.slice(0, endIndex);
}

const rules = { canICheck, canICall, canIFold, canIRaise };
export default rules;