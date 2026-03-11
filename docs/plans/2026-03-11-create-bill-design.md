# Create Bill Point Logic Design

## Goal

Align `create bill` with the approved rules:

- Request body accepts only `userId`, `name`, and `price`
- Redeemed points are derived from `user.pointTotal`
- Redeemed points cannot exceed the bill price
- Earned points are calculated from the original price before discount
- A bill can create up to two transaction records: `REDEEM` and `EARN`

## Chosen Approach

Keep the existing schema and implement the full calculation inside `BillService.create` in one database transaction.

## Rules

- `redeemPoint = min(user.pointTotal, floor(price))`
- `discount = redeemPoint`
- `amount = price - discount`
- `earnPoint = floor(price * 0.1)`
- `bill.point` stores `earnPoint`
- Create `REDEEM` only when `redeemPoint > 0`
- Create `EARN` only when `earnPoint > 0`
- Update `user.pointTotal` by the net result: `earnPoint - redeemPoint`

## Consequences

- If earned points exceed redeemed points, the user gains net points
- If redeemed points exceed earned points, the user's point total decreases
- If both values are equal, the user's point total remains unchanged

## Testing Scope

- User without points earns new points only
- User redeems some points and still earns more than redeemed
- User redeems more than earned and loses net points
- Redeemed points are capped by the bill price
