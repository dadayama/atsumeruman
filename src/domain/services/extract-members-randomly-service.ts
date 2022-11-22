import { Members } from '../../entities'

export type IExtractMembersRandomlyService = {
  execute(members: Members, numberOfMember: number, excluded?: Members): Members
}

export class ExtractMembersRandomlyService implements IExtractMembersRandomlyService {
  execute(members: Members, numberOfMember: number, excluded?: Members): Members {
    const extracted = members
      .remove(excluded || new Members([]))
      .pickRandomlyToFill(numberOfMember, members)

    if (extracted.count < numberOfMember) {
      const diff = numberOfMember - extracted.count
      const additional = members.remove(extracted).pickRandomlyToFill(diff, members)
      extracted.add(additional)
    }

    return extracted
  }
}
